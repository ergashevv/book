import React from 'react';
import ReactDOM from 'react-dom/client';
import { LangProvider } from './contexts/LangContext';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ReadingProvider } from './contexts/ReadingContext';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LangProvider>
      <AuthProvider>
        <CartProvider>
          <ReadingProvider>
            <App />
          </ReadingProvider>
        </CartProvider>
      </AuthProvider>
    </LangProvider>
  </React.StrictMode>
);
