import { apiClient } from './api.client';
import type { LoginRequest, LoginResponse, AuthUser, ValidateTokenResponse } from '../types/types';
import { useAuthStore } from '../store/auth.store';

function setAuthenticatedUser(user: AuthUser): void {
  useAuthStore.setState({ user, isAuthenticated: true, error: null });
}

function clearAuthState(): void {
  useAuthStore.getState().clearAuth();
}

export const authService = {
  /**
   * Login with email/phone + password
   */
  async login(request: LoginRequest): Promise<AuthUser> {
    const response = await apiClient.post<LoginResponse>('/api/auth/login', request);
    const { expiresAtUtc, personId, personType, email } = response.data;

    const authUser: AuthUser = {
      personId,
      personType,
      email,
      expiresAt: new Date(expiresAtUtc),
    };

    setAuthenticatedUser(authUser);

    return authUser;
  },

  /**
   * Logout: clear token and user data
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/api/auth/logout');
    } finally {
      clearAuthState();
    }
  },

  /**
   * Check if user is authenticated in current store state
   */
  isAuthenticated(): boolean {
    return useAuthStore.getState().isAuthenticated;
  },

  /**
   * Restore auth state from secure cookie-backed session
   */
  async restoreAuth(): Promise<AuthUser | null> {
    try {
      const response = await apiClient.get<ValidateTokenResponse>('/api/auth/validate');
      const validatedUser: AuthUser = {
        personId: response.data.personId,
        personType: response.data.personType,
        email: response.data.email,
      };

      setAuthenticatedUser(validatedUser);
      return validatedUser;
    } catch {
      clearAuthState();
      return null;
    }
  },
};
