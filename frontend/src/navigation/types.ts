import type { RoutingProfile, RouteResponse } from '../types/contracts';

export type RootStackParamList = {
  OriginInput: undefined;
  DestinationInput: { originPlaceId: string; originDisplayName: string };
  Loading: {
    originPlaceId: string;
    originDisplayName: string;
    destinationPlaceId: string;
    destinationDisplayName: string;
    profile: RoutingProfile;
  };
  Guide: { route: RouteResponse; originLabel: string };
  Arrived: { route: RouteResponse };
};
