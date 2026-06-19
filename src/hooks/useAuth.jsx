import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import NexData from '../data/NexData';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    NexData.init();
    const u = NexData.getCurrentUser();
    return u && u.id ? u : null;
  });

  const login = useCallback((email, password, role) => {
    const users = NexData.getUsers();
    const found = users.find(
      u => u.email === email && u.password === password && u.role === role
    );
    if (found) {
      NexData.setCurrentUser(found);
      setUser(found);
      return { success: true, user: found };
    }
    return { success: false, error: 'Invalid credentials' };
  }, []);

  const signup = useCallback((data) => {
    const users = NexData.getUsers();
    if (users.find(u => u.email === data.email)) {
      return { success: false, error: 'Email already exists' };
    }
    const newUser = {
      id: NexData.genId(),
      name: `${data.firstName} ${data.lastName}`,
      email: data.email,
      password: data.password,
      role: 'student',
      rollNo: data.rollNo || '',
      department: data.department || '',
      semester: data.semester || '',
      joinedAt: new Date().toISOString().split('T')[0],
    };
    users.push(newUser);
    NexData.saveUsers(users);
    NexData.setCurrentUser(newUser);
    setUser(newUser);
    return { success: true, user: newUser };
  }, []);

  const logout = useCallback(() => {
    NexData.clearCurrentUser();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthContext;
