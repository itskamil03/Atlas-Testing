import { api } from './api';
import { clearTokens, getRefreshToken } from './auth';
import { extractApiErrorMessage } from './errors';

export async function logout(): Promise<void> {
  try {
    const refresh = getRefreshToken();
    if (refresh) {
      await api.post('/auth/logout', { refresh_token: refresh });
    }
  } catch {
    // Best-effort server logout; local tokens are always cleared.
  } finally {
    clearTokens();
  }
}

export async function logoutAll(): Promise<void> {
  try {
    await api.post('/auth/logout-all');
  } catch (err) {
    // ignore
  } finally {
    clearTokens();
  }
}

export default { logout, logoutAll };
