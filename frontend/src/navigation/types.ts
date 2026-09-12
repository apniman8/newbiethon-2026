import type { RoutingProfile, RouteResponse } from '../types/contracts';

export type RootStackParamList = {
  OriginInput: undefined;
  // docs/ADR.md ADR-013: originLabel is display-only (whatever the traveller typed).
  // profile is picked on the origin screen and just carried through here.
  DestinationInput: { originLabel: string; profile: RoutingProfile };
  // docs/ADR.md ADR-012: destinationText is free text, matched in Loading.
  Loading: { originLabel: string; destinationText: string; profile: RoutingProfile };
  Guide: { route: RouteResponse; originLabel: string };
  Arrived: { route: RouteResponse };
};
