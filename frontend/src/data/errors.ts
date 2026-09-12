// docs/ADR.md ADR-007: routeService throws only this typed error, never a
// generic Error, so screens can show a different message per failure kind
// (docs/PRD.md "데이터 로딩 실패").

import type { BackendErrorCode } from '../types/contracts';

export type RouteServiceErrorKind = 'NETWORK' | 'NOT_FOUND' | 'INVALID_REQUEST' | 'SERVER_ERROR';

export class RouteServiceError extends Error {
  readonly kind: RouteServiceErrorKind;

  constructor(kind: RouteServiceErrorKind, message?: string) {
    super(message ?? kind);
    this.name = 'RouteServiceError';
    this.kind = kind;
  }
}

// The v1.2 backend names its failures in the response body (ErrorCode.java).
// Prefer that code over the bare status — "no route for this profile" and
// "unknown map" are both 404 but read very differently to a user.
const CODE_TO_KIND: Record<BackendErrorCode, RouteServiceErrorKind> = {
  INVALID_REQUEST: 'INVALID_REQUEST',
  VALIDATION_ERROR: 'INVALID_REQUEST',
  INVALID_PLACE: 'INVALID_REQUEST',
  INVALID_PROFILE: 'INVALID_REQUEST',
  MAP_NOT_FOUND: 'NOT_FOUND',
  ROUTE_NOT_FOUND: 'NOT_FOUND',
  API_NOT_FOUND: 'NOT_FOUND',
  GRAPH_DATA_INVALID: 'SERVER_ERROR',
  INTERNAL_SERVER_ERROR: 'SERVER_ERROR',
};

export function errorKindFromStatus(status: number): RouteServiceErrorKind {
  if (status === 404) return 'NOT_FOUND';
  if (status === 400 || status === 422) return 'INVALID_REQUEST';
  return 'SERVER_ERROR';
}

// Falls back to the status when the body has no recognizable code — the live
// error body has not been observed against a running backend yet.
export function errorKindFromBody(body: unknown, status: number): RouteServiceErrorKind {
  const code = (body as { code?: string } | null)?.code;
  if (code && code in CODE_TO_KIND) {
    return CODE_TO_KIND[code as BackendErrorCode];
  }
  return errorKindFromStatus(status);
}
