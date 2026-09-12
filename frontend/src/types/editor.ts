import type { ImagePoint, MovementType, NodeType } from './contracts';

export interface EditableMapImage {
  id: string;
  displayName: string;
  assetKey: string;
  width: number;
  height: number;
}

export interface EditableNode {
  id: string;
  nodeType: NodeType;
  floor: string;
  mapImageId: string;
  imageX: number;
  imageY: number;
  description: string;
  facilityId: string | null;
}

export interface EditableEdge {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  movementType: MovementType;
  geometry: ImagePoint[];
}

export interface EditableStationMap {
  mapId: string;
  version: string;
  mapImages: EditableMapImage[];
  nodes: EditableNode[];
  edges: EditableEdge[];
}
