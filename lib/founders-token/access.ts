import 'server-only';

/**
 * Dostęp Founders — osobny mechanizm od planu (FREE / STARTER / PRO / ELITE).
 *
 *   const founders = await hasFoundersAccess(session.userId);
 *   const summary = await getFoundersAccess(session.userId);
 */
export { hasFoundersAccess, getFoundersTokenForUser, getFoundersAccess } from './service';
