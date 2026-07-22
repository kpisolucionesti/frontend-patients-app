import { createContext, useContext, useState, useCallback, useMemo } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem('auth_token'));

  const [permissions, setPermissions] = useState(() => {
    const stored = localStorage.getItem('user_permissions');
    return stored ? JSON.parse(stored) : [];
  });

  const signIn = useCallback((response) => {
    localStorage.setItem('auth_token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    localStorage.setItem('user_permissions', JSON.stringify(response.user.permissions));
    setToken(response.token);
    setUser(response.user);
    setPermissions(response.user.permissions || []);
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    localStorage.removeItem('user_permissions');
    setToken(null);
    setUser(null);
    setPermissions([]);
  }, []);

  const hasPermission = useCallback((perm) => permissions.includes(perm), [permissions]);

  const value = useMemo(() => ({
    user,
    token,
    permissions,
    isAuthenticated: !!token,
    signIn,
    signOut,
    hasPermission,
  }), [user, token, permissions, signIn, signOut, hasPermission]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
