'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getMockUser, setMockUser, isProfileComplete, markProfileComplete, DEFAULT_USER } from '@/lib/mock-auth';
import { MockUser } from '@/types/activity';

interface AuthContextValue {
  user: MockUser;
  updateUser: (updates: Partial<MockUser>) => void;
  profileComplete: boolean;
  completeProfile: () => void;
  hydrated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function MockAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MockUser>(DEFAULT_USER);
  const [profileComplete, setProfileComplete] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setUser(getMockUser());
    setProfileComplete(isProfileComplete());
    setHydrated(true);
  }, []);

  function updateUser(updates: Partial<MockUser>) {
    setMockUser(updates);
    setUser(getMockUser());
  }

  function completeProfile() {
    markProfileComplete();
    setProfileComplete(true);
  }

  return (
    <AuthContext.Provider value={{ user, updateUser, profileComplete, completeProfile, hydrated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside MockAuthProvider');
  return ctx;
}
