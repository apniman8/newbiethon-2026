import type { RoutingProfile, RouteResponse } from '../types/contracts';

export type RootStackParamList = {
  OriginInput: undefined;
  // originLabel is the display text; originPlaceId is the real (or fallback)
  // start place resolved on the origin screen — picking a different real
  // place there changes what actually gets routed from.
  DestinationInput: { originLabel: string; originPlaceId: string; profile: RoutingProfile };
  // docs/ADR.md ADR-012: destinationText is free text, matched in Loading.
  Loading: { originLabel: string; originPlaceId: string; destinationText: string; profile: RoutingProfile };
  Guide: { route: RouteResponse; originLabel: string };
  Arrived: { route: RouteResponse };
};
