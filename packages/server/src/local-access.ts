import { createLocalReviewAccess } from './review-access';
import { getLocalProjectStore } from './local-project';
/** A shared, persisted session and CSRF token across local Studio capabilities. */
export function getLocalStudioAccess() {
  return createLocalReviewAccess(Date.now, { cookie: 'fluid_studio', path: '/api', header: 'x-fluid-studio-token' }, getLocalProjectStore().sessions);
}
