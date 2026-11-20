/** Stable HTTP/stream status is independent of the provider's error text. */
export function aiRequestMessage(status: number) {
  switch (status) {
    case 400: case 422: return 'aiBadRequest';
    case 401: case 403: return 'aiAccess';
    case 409: return 'aiConflict';
    case 413: return 'aiSize';
    case 402: case 429: return 'aiLimit';
    case 408: case 504: return 'aiTimeout';
    default: return 'aiUnavailable';
  }
}

export class AIRequestError extends Error {
  constructor(readonly status: number) { super('AI request returned HTTP ' + status); }
}
