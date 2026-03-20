import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const STORAGE_KEYS = {
  user: 'app_user',
  onboarding: 'app_onboarding_seen',
  authMethod: 'app_auth_method',
};

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [onboardingSeen, setOnboardingSeen] = useState(false);
  const [authMethod, setAuthMethod] = useState(null); // 'telegram' | 'sms'
  const [pendingPhone, setPendingPhone] = useState(null);
  const [pendingName, setPendingName] = useState(null);
  const [pendingPassword, setPendingPassword] = useState(null);
  const [isRestoring, setIsRestoring] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const restore = () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEYS.user);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (!cancelled && parsed && typeof parsed === 'object') setUser(parsed);
        }
        const seen = localStorage.getItem(STORAGE_KEYS.onboarding) === '1';
        if (!cancelled) setOnboardingSeen(seen);
        const method = localStorage.getItem(STORAGE_KEYS.authMethod);
        if ((method === 'telegram' || method === 'sms') && !cancelled) setAuthMethod(method);
      } catch (_) {}
      if (!cancelled) setIsRestoring(false);
    };
    restore();
    return () => { cancelled = true; };
  }, []);

  const persistUser = useCallback((u) => {
    setUser(u);
    if (u) localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(u));
    else localStorage.removeItem(STORAGE_KEYS.user);
  }, []);

  const finishOnboarding = useCallback(() => {
    setOnboardingSeen(true);
    localStorage.setItem(STORAGE_KEYS.onboarding, '1');
  }, []);

  const requestCode = useCallback(async (phone, method) => {
    setAuthMethod(method);
    localStorage.setItem(STORAGE_KEYS.authMethod, method);
    setPendingPhone(phone);
    // Simulate: backend would send code via Telegram @VerificationCodes or SMS
    const code = '1234';
    if (typeof window !== 'undefined') window.__devVerificationCode = code;
    return { success: true };
  }, []);

  const login = useCallback(async (phone, password) => {
    setPendingPhone(phone);
    setPendingPassword(password);
    const code = '1234';
    if (typeof window !== 'undefined') window.__devVerificationCode = code;
    return { success: true, needVerify: true };
  }, []);

  const verifyCode = useCallback((code, options = {}) => {
    const devCode = typeof window !== 'undefined' && window.__devVerificationCode;
    const ok = devCode ? code === devCode : code === '1234';
    if (!ok) return { success: false, error: 'Invalid code' };
    if (options.afterSignUp && pendingName && pendingPhone && pendingPassword) {
      const u = {
        id: Date.now(),
        name: pendingName,
        phone: pendingPhone,
        authMethod: authMethod || 'sms',
      };
      persistUser(u);
      setPendingName(null);
      setPendingPhone(null);
      setPendingPassword(null);
      return { success: true, isNewUser: true };
    }
    if (pendingPhone && pendingPassword) {
      persistUser({
        id: Date.now(),
        name: pendingName || 'User',
        phone: pendingPhone,
        authMethod: authMethod || 'sms',
      });
      setPendingPhone(null);
      setPendingPassword(null);
      setPendingName(null);
      return { success: true };
    }
    if (options.afterForgotPassword) return { success: true };
    return { success: true };
  }, [pendingName, pendingPhone, pendingPassword, authMethod, persistUser]);

  const signUp = useCallback(async (name, phone, password) => {
    setPendingName(name);
    setPendingPhone(phone);
    setPendingPassword(password);
    const code = '1234';
    if (typeof window !== 'undefined') window.__devVerificationCode = code;
    return { success: true, needVerify: true };
  }, []);

  const logout = useCallback(() => {
    persistUser(null);
  }, [persistUser]);

  const forgotPasswordRequest = useCallback(async (phone, method) => {
    setAuthMethod(method);
    setPendingPhone(phone);
    const code = '1234';
    if (typeof window !== 'undefined') window.__devVerificationCode = code;
    return { success: true };
  }, []);

  const resetPassword = useCallback((newPassword) => {
    setPendingPassword(newPassword);
    setPendingPhone(null);
    return { success: true };
  }, []);

  const value = {
    user,
    onboardingSeen,
    authMethod,
    pendingPhone,
    pendingName,
    isRestoring,
    finishOnboarding,
    requestCode,
    login,
    verifyCode,
    signUp,
    logout,
    forgotPasswordRequest,
    resetPassword,
    persistUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
