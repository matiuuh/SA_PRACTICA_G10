export interface JwtPayload {
  sub: string;
  name: string;
  email: string;
  role: string;
  exp?: number;
}

export const parseTokenPayload = (token: string): JwtPayload | null => {
  try {
    const base64Payload = token.split('.')[1];

    if (!base64Payload) {
      return null;
    }

    const normalizedPayload = base64Payload.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(normalizedPayload)
        .split('')
        .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
        .join(''),
    );

    return JSON.parse(jsonPayload) as JwtPayload;
  } catch {
    return null;
  }
};

export const isTokenExpired = (token: string): boolean => {
  const payload = parseTokenPayload(token);

  if (!payload?.exp) {
    return false;
  }

  return payload.exp * 1000 <= Date.now();
};

export const clearStoredSession = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('user');
};
