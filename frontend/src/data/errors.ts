// docs/ADR.md ADR-007: routeService throws only this typed error, never a
// generic Error, so screens can show a different message per failure kind
// (docs/PRD.md "데이터 로딩 실패").

export type RouteServiceErrorKind = 'NETWORK' | 'NOT_FOUND' | 'INVALID_REQUEST' | 'SERVER_ERROR';

export class RouteServiceError extends Error {
  readonly kind: RouteServiceErrorKind;

  constructor(kind: RouteServiceErrorKind, message?: string) {
    super(message ?? kind);
    this.name = 'RouteServiceError';
    this.kind = kind;
  }
}

export function errorKindFromStatus(status: number): RouteServiceErrorKind {
  if (status === 404) return 'NOT_FOUND';
  if (status === 400 || status === 422) return 'INVALID_REQUEST';
  return 'SERVER_ERROR';
}
