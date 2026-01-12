import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

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

interface HoldingSymbol {
  exchange: string;
  token: string;
  tradingSymbol: string;
  pdc: string;
  ltp: string;
}

interface HoldingItem {
  isin: string;
  realizedPnl: string;
  unrealizedPnl: string;
  netPnl: string;
  netQty: string;
  buyPrice: string;
  holdQty: string;
  dpQty: string;
  benQty: string;
  unpledgedQty: string;
  collateralQty: string;
  brkCollQty: string;
  btstQty: string;
  usedQty: string;
  tradedQty: string;
  sellableQty: string;
  authQty: string;
  sellAmount: string;
  authFlag: boolean;
  symbol: HoldingSymbol[];
}

interface HoldingResult {
  poa: boolean;
  product: string;
  holdings: HoldingItem[];
}

interface OrderBookItem {
  orderNo: string;
  userId: string;
  actId: string;
  exchange: string;
  tradingSymbol: string;
  qty: string;
  transType: string;
  ret: string;
  token: string;
  multiplier: string;
  lotSize: string;
  tickSize: string;
  price: string;
  avgTradePrice: string | null;
  disclosedQty: string;
  product: string;
  priceType: string;
  orderType: string;
  orderStatus: string;
  fillShares: string;
  exchUpdateTime: string | null;
  exchOrderId: string | null;
  formattedInsName: string;
  ltp: string | null;
  rejectedReason: string | null;
  triggerPrice: string | null;
  mktProtection: string | null;
  target: string | null;
  stopLoss: string | null;
  trailingPrice: string | null;
  snoOrderNumber: string | null;
  snoFillid: string | null;
  orderTime: string;
  rprice: string;
  rqty: string;
}

interface TradeBookItem {
  orderNo: string;
  userId: string;
  actId: string;
  exchange: string;
  ret: string;
  product: string;
  orderType: string;
  priceType: string;
  fillId: string;
  fillTime: string;
  transType: string;
  tradingSymbol: string;
  qty: string;
  token: string;
  fillshares: string;
  fillqty: string;
  pricePrecision: string;
  lotSize: string;
  tickSize: string;
  price: string;
  prcftr: string;
  fillprc: string;
  exchUpdateTime: string;
  exchOrderId: string;
  formattedInsName: string;
  ltp: string | null;
  orderTime: string;
}

interface AuthContextType {
  user: any | null;
  clientDetails: ClientDetails | null;
  holdings: HoldingResult[] | null;
  orders: OrderBookItem[] | null;
  trades: TradeBookItem[] | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  login: () => void;
  logout: () => void;
  handleCallback: (authCode: string, userId: string) => Promise<void>;
  refreshHoldings: () => Promise<void>;
  refreshOrders: () => Promise<void>;
  refreshTrades: () => Promise<void>;
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
  const [holdings, setHoldings] = useState<HoldingResult[] | null>(() => {
    const saved = localStorage.getItem('userHoldings');
    return saved ? JSON.parse(saved) : null;
  });
  const [orders, setOrders] = useState<OrderBookItem[] | null>(() => {
    const saved = localStorage.getItem('userOrders');
    return saved ? JSON.parse(saved) : null;
  });
  const [trades, setTrades] = useState<TradeBookItem[] | null>(() => {
    const saved = localStorage.getItem('userTrades');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  const isAuthenticated = Boolean(token && clientDetails);

  const login = useCallback(() => {
    window.location.href = LOGIN_URL;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setClientDetails(null);
    setHoldings(null);
    setOrders(null);
    setTrades(null);
    localStorage.removeItem('userSession');
    localStorage.removeItem('clientDetails');
    localStorage.removeItem('userHoldings');
    localStorage.removeItem('userOrders');
    localStorage.removeItem('userTrades');
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

  const fetchHoldings = useCallback(async (bearerToken: string) => {
    try {
      const response = await fetch('https://web.gopocket.in/ho-rest/api/holdings/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${bearerToken}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.status === 'Ok' && data.result) {
        setHoldings(data.result);
        localStorage.setItem('userHoldings', JSON.stringify(data.result));
      }
    } catch (error) {
      console.error('Error fetching holdings:', error);
    }
  }, []);

  const fetchOrderBook = useCallback(async (bearerToken: string) => {
    try {
      const response = await fetch('https://web.gopocket.in/od-rest/api/info/orderbook', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${bearerToken}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.status === 'Ok' && data.result) {
        setOrders(data.result);
        localStorage.setItem('userOrders', JSON.stringify(data.result));
      }
    } catch (error) {
      console.error('Error fetching order book:', error);
    }
  }, []);

  const fetchTradeBook = useCallback(async (bearerToken: string) => {
    try {
      const response = await fetch('https://web.gopocket.in/od-rest/api/info/tradebook', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${bearerToken}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.status === 'Ok' && data.result) {
        setTrades(data.result);
        localStorage.setItem('userTrades', JSON.stringify(data.result));
      }
    } catch (error) {
      console.error('Error fetching trade book:', error);
    }
  }, []);

  const handleCallback = useCallback(async (authCode: string, userId: string) => {
    setIsLoading(true);
    try {
      // Call backend SSO endpoint
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

      // Response structure: { message: { stat: "Ok", client_code: "...", bearer_token: "..." } }
      if (data.message && data.message.stat === 'Ok' && data.message.bearer_token) {
        const bearerToken = data.message.bearer_token;
        setToken(bearerToken);
        localStorage.setItem('userSession', bearerToken);

        // Fetch user data from broker APIs
        await Promise.all([
          fetchClientDetails(bearerToken),
          fetchHoldings(bearerToken),
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
  }, [fetchClientDetails, fetchHoldings, fetchOrderBook, fetchTradeBook]);

  const refreshHoldings = useCallback(async () => {
    if (token) {
      await fetchHoldings(token);
    }
  }, [token, fetchHoldings]);

  const refreshOrders = useCallback(async () => {
    if (token) {
      await fetchOrderBook(token);
    }
  }, [token, fetchOrderBook]);

  const refreshTrades = useCallback(async () => {
    if (token) {
      await fetchTradeBook(token);
    }
  }, [token, fetchTradeBook]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authCode = params.get('authCode');
    const userId = params.get('userId');

    if (authCode && userId && !token) {
      handleCallback(authCode, userId).then(() => {
        // Clear params from URL after successful auth to keep it clean
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      }).catch(err => {
        console.error("Auto-auth failed:", err);
      });
    }
  }, [token, handleCallback]);

  // Fetch holdings on mount if token exists
  useEffect(() => {
    if (token) {
      if (!holdings) fetchHoldings(token);
      if (!orders) fetchOrderBook(token);
      if (!trades) fetchTradeBook(token);
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{
      user: clientDetails ? {
        ...clientDetails,
        role: 'admin', // Default role for compatibility
        id: clientDetails.clientName || clientDetails.userId,
      } : null,
      clientDetails,
      holdings,
      orders,
      trades,
      isAuthenticated,
      isLoading,
      token,
      login,
      logout,
      handleCallback,
      refreshHoldings,
      refreshOrders,
      refreshTrades
    }}>
      {children}
    </AuthContext.Provider>
  );
};