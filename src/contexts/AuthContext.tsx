import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { HoldingResult } from './HoldingContext';
import { OrderBookItem, TradeBookItem } from './OrderContext';

interface BankDetail {
  bankName: string;
  accNumber: string;
  ifsc: string;
  micr: string;
}

interface DpAccountNumber {
  dpAccountNumber: string;
  dpId: string | null;
  boId: string | null;
  repository: string | null;
  edisClientCode: string | null;
  dpAccountName: string | null;
}

interface ClientDetails {
  userId: string;
  actId: string;
  clientName: string;
  actStatus: string;
  createdDate: string;
  createdTime: string;
  mobNo: string;
  email: string;
  pan: string;
  address: string;
  officeAddress: string;
  city: string;
  state: string;
  mandateIdList: string[];
  exchange: string[];
  bankdetails: BankDetail[];
  dpAccountNumber: DpAccountNumber[];
  orders: string[];
  brokerName: string;
  products: string[];
  productTypes: string[];
  orderTypes: string[] | null;
  priceTypes: string[];
  dpAcctNum: string | null;
}

interface AuthContextType {
  user: any | null;
  clientDetails: ClientDetails | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  websocketKey: string | null;
  login: () => void;
  logout: () => void;
  handleCallback: (authCode: string, userId: string, fetchHoldings: any, fetchOrderBook: any, fetchTradeBook: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOGIN_URL = "https://web.gopocket.in/?appcode=MJvlmDPFOPnrsxu";

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [clientDetails, setClientDetails] = useState<ClientDetails | null>(() => {
    const saved = localStorage.getItem('clientDetails');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('userSession'));
  const [websocketKey, setWebsocketKey] = useState<string | null>(() => localStorage.getItem('websocketKey'));
  const [isLoading, setIsLoading] = useState(false);

  const isAuthenticated = Boolean(token && clientDetails);

  const login = useCallback(() => {
    window.location.href = LOGIN_URL;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setClientDetails(null);
    setWebsocketKey(null);
    localStorage.removeItem('userSession');
    localStorage.removeItem('clientDetails');
    localStorage.removeItem('websocketKey');
    // We'll handle clearing other contexts in their respective providers or via a combined logout
  }, []);

  const fetchClientDetails = useCallback(async (bearerToken: string) => {
    try {
      const response = await fetch('https://web.gopocket.in/client-rest/profile/getclientdetails', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${bearerToken}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.status === 'Ok' && data.result && data.result.length > 0) {
        const details = data.result[0];
        setClientDetails(details);
        localStorage.setItem('clientDetails', JSON.stringify(details));
      }
    } catch (error) {
      console.error('Error fetching client details:', error);
      logout();
    }
  }, [logout]);

  const fetchUserDetails = useCallback(async (bearerToken: string) => {
    try {
      const response = await fetch('https://web.gopocket.in/client-rest/profile/getUser', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${bearerToken}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.status === 'Ok' && data.result && data.result.length > 0) {
        const key = data.result[0].key;
        setWebsocketKey(key);
        localStorage.setItem('websocketKey', key);
      }
    } catch (error) {
      console.error('Error fetching user details (key):', error);
    }
  }, []);

  const handleCallback = useCallback(async (authCode: string, userId: string, fetchHoldings: any, fetchOrderBook: any, fetchTradeBook: any) => {
    setIsLoading(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
      const apiUrl = `${API_BASE_URL}/api/method/rms.sso.sso_callback`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        body: JSON.stringify({
          authCode,
          userId
        }),
      });

      const data = await response.json();

      if (data.message && data.message.stat === 'Ok' && data.message.bearer_token) {
        const bearerToken = data.message.bearer_token;
        setToken(bearerToken);
        localStorage.setItem('userSession', bearerToken);

        await Promise.all([
          fetchClientDetails(bearerToken),
          fetchUserDetails(bearerToken),
          fetchHoldings(bearerToken, userId),
          fetchOrderBook(bearerToken),
          fetchTradeBook(bearerToken)
        ]);
      } else {
        throw new Error(data.message?.message || 'SSO Login Failed');
      }
    } catch (error) {
      console.error('SSO Callback error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [fetchClientDetails, fetchUserDetails]);

  return (
    <AuthContext.Provider value={{
      user: clientDetails ? {
        ...clientDetails,
        role: 'admin',
        id: clientDetails.clientName || clientDetails.userId,
      } : null,
      clientDetails,
      isAuthenticated,
      isLoading,
      token,
      websocketKey,
      login,
      logout,
      handleCallback
    }}>
      {children}
    </AuthContext.Provider>
  );
};