import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  ImageBackground,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { getMapAsset } from '../assets/mapImages';
import { getStationMap, saveGraphPatch } from '../data/routeService';
import { colors } from '../theme/tokens';
import type { EditableEdge, EditableNode, EditableStationMap } from '../types/editor';

const MAP_ID = 'SEOUL_STATION_KTX_TO_AREX';
const STORAGE_KEY = `node-editor:${MAP_ID}`;
const MARKER_SIZE = 18;

type Size = { width: number; height: number };
type CoordinatePatch = Record<string, { imageX: number; imageY: number }>;

function clamp(value: number) {
  return Math.max(0, Math.min(1, value));
}

function adjustedEdgeGeometry(edge: EditableEdge, nodesById: Map<string, EditableNode>) {
  const from = nodesById.get(edge.fromNodeId);
  const to = nodesById.get(edge.toNodeId);
  const points = edge.geometry.map((point) => ({ ...point }));
  if (!from || !to) return points;
  if (points.length < 2) {
    points.splice(0, points.length, { x: from.imageX, y: from.imageY }, { x: to.imageX, y: to.imageY });
  } else {
    points[0] = { x: from.imageX, y: from.imageY };
    points[points.length - 1] = { x: to.imageX, y: to.imageY };
  }
  return points;
}

function edgePath(edge: EditableEdge, nodesById: Map<string, EditableNode>) {
  const points = adjustedEdgeGeometry(edge, nodesById);
  return points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
}

function NodeMarker({
  node,
  size,
  selected,
  onSelect,
  onMove,
}: {
  node: EditableNode;
  size: Size;
  selected: boolean;
  onSelect: (nodeId: string) => void;
  onMove: (nodeId: string, imageX: number, imageY: number) => void;
}) {
  // `node` changes on every drag frame (that's the point — imageX/imageY move).
  // Keeping it out of the memo deps and reading it via this ref instead means
  // the PanResponder instance survives the whole gesture: recreating it
  // mid-drag (as a `[node.imageX, node.imageY]` dep list would) drops the
  // browser's pointer capture on every pixel of movement, which is why drags
  // used to barely register.
  const nodeRef = useRef(node);
  nodeRef.current = node;
  const dragStart = useRef({ x: node.imageX, y: node.imageY });
  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          dragStart.current = { x: nodeRef.current.imageX, y: nodeRef.current.imageY };
          onSelect(nodeRef.current.id);
        },
        onPanResponderMove: (_, gesture) => {
          if (size.width === 0 || size.height === 0) return;
          onMove(
            nodeRef.current.id,
            clamp(dragStart.current.x + gesture.dx / size.width),
            clamp(dragStart.current.y + gesture.dy / size.height),
          );
        },
      }),
    [onMove, onSelect, size.height, size.width],
  );

  return (
    <View
      {...responder.panHandlers}
      style={[
        styles.marker,
        {
          left: node.imageX * size.width - MARKER_SIZE / 2,
          top: node.imageY * size.height - MARKER_SIZE / 2,
        },
        selected && styles.markerSelected,
      ]}
    >
      <Text style={styles.markerLabel}>{node.id.split('-').at(-1)}</Text>
    </View>
  );
}

export function NodeEditorScreen() {
  const [map, setMap] = useState<EditableStationMap | null>(null);
  const [nodes, setNodes] = useState<EditableNode[]>([]);
  const [selectedMapId, setSelectedMapId] = useState('');
  const [selectedFloor, setSelectedFloor] = useState('ALL');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    getStationMap(MAP_ID)
      .then((response) => {
        let saved: CoordinatePatch = {};
        if (Platform.OS === 'web') {
          try {
            saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}');
          } catch {
            saved = {};
          }
        }
        const restored = response.nodes.map((node) => ({ ...node, ...(saved[node.id] ?? {}) }));
        setMap(response);
        setNodes(restored);
        setSelectedMapId(response.mapImages[0]?.id ?? '');
      })
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : 'Could not load map data.'));
  }, []);

  const originalById = useMemo(() => new Map(map?.nodes.map((node) => [node.id, node]) ?? []), [map]);
  const nodesById = useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes]);
  const selectedNode = selectedNodeId ? nodesById.get(selectedNodeId) ?? null : null;
  const selectedMap = map?.mapImages.find((image) => image.id === selectedMapId);
  const asset = getMapAsset(selectedMap?.assetKey);
  // CSS `aspectRatio` on the ImageBackground isn't reliably honored by
  // react-native-web here (the image's own intrinsic height leaks through
  // and stretches the box), so the height is computed explicitly from the
  // measured width instead of trusted to layout.
  const size: Size =
    asset && containerWidth > 0
      ? { width: containerWidth, height: containerWidth * (asset.height / asset.width) }
      : { width: 0, height: 0 };
  const floors = useMemo(
    () => ['ALL', ...Array.from(new Set(nodes.filter((node) => node.mapImageId === selectedMapId).map((node) => node.floor)))],
    [nodes, selectedMapId],
  );
  const visibleNodes = nodes.filter(
    (node) => node.mapImageId === selectedMapId && (selectedFloor === 'ALL' || node.floor === selectedFloor),
  );
  const visibleNodeIds = new Set(visibleNodes.map((node) => node.id));
  const visibleEdges =
    map?.edges.filter((edge) => visibleNodeIds.has(edge.fromNodeId) && visibleNodeIds.has(edge.toNodeId)) ?? [];

  const changedNodes = nodes.filter((node) => {
    const original = originalById.get(node.id);
    return original && (original.imageX !== node.imageX || original.imageY !== node.imageY);
  });

  const moveNode = useCallback((nodeId: string, imageX: number, imageY: number) => {
    setNodes((current) => current.map((node) => (node.id === nodeId ? { ...node, imageX, imageY } : node)));
  }, []);

  useEffect(() => {
    if (!map || Platform.OS !== 'web') return;
    const patch = Object.fromEntries(changedNodes.map((node) => [node.id, { imageX: node.imageX, imageY: node.imageY }]));
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(patch));
  }, [changedNodes, map]);

  const buildPatch = (currentMap: EditableStationMap) => {
    const changedNodeIds = new Set(changedNodes.map((node) => node.id));
    return {
      nodes: changedNodes.map(({ id, imageX, imageY }) => ({ id, imageX, imageY })),
      edges: currentMap.edges
        .filter((edge) => changedNodeIds.has(edge.fromNodeId) || changedNodeIds.has(edge.toNodeId))
        .map((edge) => ({ id: edge.id, geometry: adjustedEdgeGeometry(edge, nodesById) })),
    };
  };

  const copyPatch = async () => {
    if (!map) return;
    const payload = buildPatch(map);
    if (Platform.OS === 'web' && navigator.clipboard) {
      await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    }
  };

  const saveToServer = async () => {
    if (!map) return;
    if (Platform.OS !== 'web') {
      setSaveMessage('Saving only works in the web preview.');
      return;
    }
    if (changedNodes.length === 0) {
      setSaveMessage('No changes to save.');
      return;
    }
    const adminKey = window.prompt('Admin key (see ADMIN_KEY on the backend):');
    if (!adminKey) return;

    setSaving(true);
    setSaveMessage(null);
    try {
      const result = await saveGraphPatch(map.mapId, buildPatch(map), adminKey);
      setSaveMessage(result.message);
    } catch (cause) {
      setSaveMessage(cause instanceof Error ? cause.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const resetEdits = () => {
    if (!map) return;
    setNodes(map.nodes.map((node) => ({ ...node })));
    if (Platform.OS === 'web') window.localStorage.removeItem(STORAGE_KEY);
  };

  if (error) {
    return <View style={styles.center}><Text style={styles.error}>{error}</Text></View>;
  }
  if (!map || !selectedMap || !asset) {
    return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Station node editor</Text>
          <Text style={styles.subtitle}>Click a node for details. Drag it to correct its normalized coordinates.</Text>
        </View>
        <View style={styles.actions}>
          {saveMessage && <Text style={styles.saveMessage}>{saveMessage}</Text>}
          <Pressable style={styles.secondaryButton} onPress={resetEdits}>
            <Text style={styles.secondaryButtonText}>Reset local edits</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={copyPatch}>
            <Text style={styles.secondaryButtonText}>{copied ? 'Copied!' : 'Copy patch'}</Text>
          </Pressable>
          <Pressable
            style={[styles.primaryButton, (saving || changedNodes.length === 0) && styles.primaryButtonDisabled]}
            onPress={saveToServer}
            disabled={saving || changedNodes.length === 0}
          >
            <Text style={styles.primaryButtonText}>{saving ? 'Saving…' : `Save to server (${changedNodes.length})`}</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.toolbar}>
        {map.mapImages.map((image) => (
          <Pressable
            key={image.id}
            style={[styles.chip, selectedMapId === image.id && styles.chipActive]}
            onPress={() => { setSelectedMapId(image.id); setSelectedFloor('ALL'); setSelectedNodeId(null); }}
          >
            <Text style={[styles.chipText, selectedMapId === image.id && styles.chipTextActive]}>{image.displayName}</Text>
          </Pressable>
        ))}
        <View style={styles.divider} />
        {floors.map((floor) => (
          <Pressable
            key={floor}
            style={[styles.floorChip, selectedFloor === floor && styles.floorChipActive]}
            onPress={() => setSelectedFloor(floor)}
          >
            <Text style={styles.floorChipText}>{floor}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.workspace}>
        <ScrollView style={styles.mapScroll} contentContainerStyle={styles.mapScrollContent}>
          <View style={styles.mapMeasure} onLayout={(event) => setContainerWidth(event.nativeEvent.layout.width)}>
            {size.width > 0 && (
              <ImageBackground
                source={asset.source}
                resizeMode="stretch"
                style={[styles.map, { width: size.width, height: size.height }]}
              >
                <Svg style={StyleSheet.absoluteFill} viewBox="0 0 1 1" preserveAspectRatio="none" pointerEvents="none">
                  {visibleEdges.map((edge) => (
                    <Path
                      key={edge.id}
                      d={edgePath(edge, nodesById)}
                      fill="none"
                      stroke={edge.movementType === 'WALK' ? 'rgba(232,53,43,0.72)' : 'rgba(51,102,255,0.8)'}
                      strokeWidth={0.0035}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  ))}
                </Svg>
                {visibleNodes.map((node) => (
                  <NodeMarker
                    key={node.id}
                    node={node}
                    size={size}
                    selected={node.id === selectedNodeId}
                    onSelect={setSelectedNodeId}
                    onMove={moveNode}
                  />
                ))}
              </ImageBackground>
            )}
          </View>
        </ScrollView>

        <View style={styles.inspector}>
          <Text style={styles.inspectorTitle}>Node inspector</Text>
          {selectedNode ? (
            <>
              <Text style={styles.nodeId}>{selectedNode.id}</Text>
              <Info label="Type" value={selectedNode.nodeType} />
              <Info label="Floor" value={selectedNode.floor} />
              <Info label="Map" value={selectedNode.mapImageId} />
              <Info label="X" value={selectedNode.imageX.toFixed(5)} />
              <Info label="Y" value={selectedNode.imageY.toFixed(5)} />
              <Text style={styles.description}>{selectedNode.description}</Text>
              <Text style={styles.hint}>Red lines are walking edges. Blue lines are stairs, escalators, elevators, or other movement edges.</Text>
            </>
          ) : (
            <Text style={styles.empty}>Select a node on the map.</Text>
          )}
        </View>
      </View>
    </View>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <View style={styles.infoRow}><Text style={styles.infoLabel}>{label}</Text><Text style={styles.infoValue}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F4F6F8' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  error: { color: '#C62828', fontSize: 16 },
  header: { paddingHorizontal: 24, paddingVertical: 18, backgroundColor: colors.background, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 20 },
  title: { color: colors.labelStrong, fontSize: 24, fontWeight: '800' },
  subtitle: { color: colors.labelNeutral, fontSize: 13, marginTop: 3 },
  actions: { flexDirection: 'row', gap: 8 },
  secondaryButton: { borderWidth: 1, borderColor: '#D5DAE1', borderRadius: 9, paddingHorizontal: 14, paddingVertical: 10 },
  secondaryButtonText: { color: colors.labelNeutral, fontSize: 13, fontWeight: '700' },
  primaryButton: { backgroundColor: colors.primary, borderRadius: 9, paddingHorizontal: 14, paddingVertical: 10 },
  primaryButtonDisabled: { opacity: 0.5 },
  primaryButtonText: { color: colors.white, fontSize: 13, fontWeight: '800' },
  saveMessage: { color: colors.labelNeutral, fontSize: 12, maxWidth: 260 },
  toolbar: { minHeight: 54, paddingHorizontal: 24, paddingVertical: 9, backgroundColor: '#FAFBFC', borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#E5E8EC', flexDirection: 'row', alignItems: 'center', gap: 7, flexWrap: 'wrap' },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, backgroundColor: '#E9EDF2' },
  chipActive: { backgroundColor: colors.labelStrong },
  chipText: { color: colors.labelNeutral, fontSize: 12, fontWeight: '700' },
  chipTextActive: { color: colors.white },
  divider: { width: 1, height: 24, backgroundColor: '#D5DAE1', marginHorizontal: 5 },
  floorChip: { minWidth: 38, alignItems: 'center', paddingHorizontal: 10, paddingVertical: 7, borderRadius: 16 },
  floorChipActive: { backgroundColor: '#DBE6FF' },
  floorChipText: { color: colors.labelStrong, fontSize: 12, fontWeight: '800' },
  workspace: { flex: 1, flexDirection: 'row', gap: 16, padding: 16 },
  mapScroll: { flex: 1, backgroundColor: '#DDE1E6', borderRadius: 12 },
  mapScrollContent: { padding: 16 },
  mapMeasure: { width: '100%', minWidth: 760 },
  map: { position: 'relative', overflow: 'hidden', backgroundColor: colors.white },
  marker: { position: 'absolute', width: MARKER_SIZE, height: MARKER_SIZE, borderRadius: MARKER_SIZE / 2, backgroundColor: colors.white, borderWidth: 3, borderColor: colors.primary, alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,.35)', cursor: 'grab' as never },
  markerSelected: { width: 24, height: 24, borderRadius: 12, marginLeft: -3, marginTop: -3, borderColor: '#FF2D20', backgroundColor: '#FFF3F2', zIndex: 10 },
  markerLabel: { color: colors.labelStrong, fontSize: 6, fontWeight: '900' },
  inspector: { width: 280, padding: 18, borderRadius: 12, backgroundColor: colors.background, borderWidth: 1, borderColor: '#E3E7EC' },
  inspectorTitle: { color: colors.labelStrong, fontSize: 16, fontWeight: '800', marginBottom: 18 },
  nodeId: { color: colors.primaryStrong, fontSize: 15, fontWeight: '800', marginBottom: 16 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: '#EFF1F4' },
  infoLabel: { color: colors.labelAlternative, fontSize: 12, fontWeight: '700' },
  infoValue: { color: colors.labelStrong, fontSize: 12, fontWeight: '700', maxWidth: 180 },
  description: { color: colors.labelNeutral, fontSize: 13, lineHeight: 19, marginTop: 16 },
  hint: { color: colors.labelAlternative, fontSize: 11, lineHeight: 16, marginTop: 24 },
  empty: { color: colors.labelAlternative, fontSize: 13 },
});
