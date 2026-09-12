import type { RoutingProfile, RouteResponse } from '../types/contracts';

export type RootStackParamList = {
  OriginInput: undefined;
  DestinationInput: { originQuery: string; originExitNumber: string };
  Loading: {
    originQuery: string;
    originExitNumber: string;
    destinationQuery: string;
    profile: RoutingProfile;
  };
  TurnByTurn: { route: RouteResponse; originLabel: string };
  Arrived: { route: RouteResponse };
};
