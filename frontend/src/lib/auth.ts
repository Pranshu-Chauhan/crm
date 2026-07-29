'use client';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'MANAGER' | 'AGENT';
  avatarUrl?: string;
  tenant: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string;
  };
}

export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const u = localStorage.getItem('crm_user');
    return u ? JSON.parse(u) : null;
  } catch {
    return null;
  }
}

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('crm_token');
}

export function setAuthData(token: string, user: User) {
  localStorage.setItem('crm_token', token);
  localStorage.setItem('crm_user', JSON.stringify(user));
}

export function clearAuthData() {
  localStorage.removeItem('crm_token');
  localStorage.removeItem('crm_user');
}

export function isAuthenticated(): boolean {
  return !!getStoredToken();
}
