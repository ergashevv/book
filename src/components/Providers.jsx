'use client';

import { LangProvider } from '@/contexts/LangContext';
import { ReadingProvider } from '@/contexts/ReadingContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <LangProvider>
        <ReadingProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </ReadingProvider>
      </LangProvider>
    </AuthProvider>
  );
}
