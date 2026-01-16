import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface OrderBookItem {
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

export interface TradeBookItem {
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

interface OrderContextType {
    orders: OrderBookItem[] | null;
    trades: TradeBookItem[] | null;
    isLoading: boolean;
    fetchOrderBook: (bearerToken: string) => Promise<void>;
    fetchTradeBook: (bearerToken: string) => Promise<void>;
    refreshOrders: (token: string) => Promise<void>;
    refreshTrades: (token: string) => Promise<void>;
    clearOrdersAndTrades: () => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const useOrders = () => {
    const context = useContext(OrderContext);
    if (context === undefined) {
        throw new Error('useOrders must be used within an OrderProvider');
    }
    return context;
};

export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [orders, setOrders] = useState<OrderBookItem[] | null>(() => {
        const saved = localStorage.getItem('userOrders');
        return saved ? JSON.parse(saved) : null;
    });
    const [trades, setTrades] = useState<TradeBookItem[] | null>(() => {
        const saved = localStorage.getItem('userTrades');
        return saved ? JSON.parse(saved) : null;
    });
    const [isLoading, setIsLoading] = useState(false);

    const fetchOrderBook = useCallback(async (bearerToken: string) => {
        setIsLoading(true);
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
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchTradeBook = useCallback(async (bearerToken: string) => {
        setIsLoading(true);
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
        } finally {
            setIsLoading(false);
        }
    }, []);

    const refreshOrders = useCallback(async (token: string) => {
        await fetchOrderBook(token);
    }, [fetchOrderBook]);

    const refreshTrades = useCallback(async (token: string) => {
        await fetchTradeBook(token);
    }, [fetchTradeBook]);

    const clearOrdersAndTrades = useCallback(() => {
        setOrders(null);
        setTrades(null);
        localStorage.removeItem('userOrders');
        localStorage.removeItem('userTrades');
    }, []);

    return (
        <OrderContext.Provider value={{
            orders,
            trades,
            isLoading,
            fetchOrderBook,
            fetchTradeBook,
            refreshOrders,
            refreshTrades,
            clearOrdersAndTrades
        }}>
            {children}
        </OrderContext.Provider>
    );
};
