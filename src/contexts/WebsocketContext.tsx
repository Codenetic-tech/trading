import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useHoldings } from './HoldingContext';

interface LTPInfo {
    lp: string;
    pc: string;
}

interface WebsocketContextType {
    isConnected: boolean;
    ltpData: Map<string, LTPInfo>;
}

const WebsocketContext = createContext<WebsocketContextType | undefined>(undefined);

export const useWebsocket = () => {
    const context = useContext(WebsocketContext);
    if (context === undefined) {
        throw new Error('useWebsocket must be used within a WebsocketProvider');
    }
    return context;
};

export const WebsocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { websocketKey, clientDetails, isAuthenticated } = useAuth();
    const { holdings } = useHoldings();
    const [isConnected, setIsConnected] = useState(false);
    const [ltpData, setLtpData] = useState<Map<string, LTPInfo>>(new Map());
    const socketRef = useRef<WebSocket | null>(null);
    const authenticatedRef = useRef(false);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const authStateRef = useRef({ isAuthenticated, websocketKey, clientDetails });

    useEffect(() => {
        authStateRef.current = { isAuthenticated, websocketKey, clientDetails };
    }, [isAuthenticated, websocketKey, clientDetails]);

    const connect = useCallback(() => {
        if (!websocketKey || !clientDetails?.userId || socketRef.current) return;

        const socket = new WebSocket('wss://skypro.skybroking.com/NorenWSWEBCODIFI/');
        socketRef.current = socket;

        socket.onopen = () => {
            console.log('Websocket Connected');
            setIsConnected(true);

            // Send authentication message
            const authMessage = {
                t: 'c',
                susertoken: websocketKey,
                actid: clientDetails.userId, // Using userId for both as per user example
                uid: clientDetails.userId,
                source: 'WEB'
            };
            socket.send(JSON.stringify(authMessage));
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.t === 'ck' && data.s === 'OK') {
                console.log('Websocket: Internal Authentication Success');
                authenticatedRef.current = true;

                // Subscribe to indices
                const indexTokens = "BSE|1#BSE|12#NSE|26037#NSE|26000#NSE|26009";
                if (socketRef.current) {
                    socketRef.current.send(JSON.stringify({ t: 't', k: indexTokens }));
                    console.log('Websocket: Subscribed to indices:', indexTokens);
                }

                subscribeToHoldings();
            } else if (data.t === 'tk' || data.t === 'tf') {
                // Update LTP data
                setLtpData(prev => {
                    const newMap = new Map(prev);
                    newMap.set(data.tk, {
                        lp: data.lp || prev.get(data.tk)?.lp || '0',
                        pc: data.pc || prev.get(data.tk)?.pc || '0'
                    });
                    return newMap;
                });
            }
        };

        socket.onclose = (event) => {
            console.log('Websocket: Connection closed', event.code, event.reason);
            setIsConnected(false);
            authenticatedRef.current = false;
            socketRef.current = null;

            const currentAuth = authStateRef.current;
            // Only attempt reconnection if we are still supposed to be authenticated
            if (currentAuth.isAuthenticated && currentAuth.websocketKey && currentAuth.clientDetails) {
                console.log('Websocket: Scheduling reconnection in 5s');
                if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
                reconnectTimeoutRef.current = setTimeout(connect, 5000);
            } else {
                console.log('Websocket: Will not reconnect because user is not authenticated or logged out', {
                    auth: currentAuth.isAuthenticated,
                    hasKey: !!currentAuth.websocketKey,
                    hasDetails: !!currentAuth.clientDetails
                });
            }
        };

        socket.onerror = (error) => {
            console.error('Websocket Error:', error);
            socket.close();
        };
    }, [websocketKey, clientDetails]);

    const subscribeToHoldings = useCallback(() => {
        if (!socketRef.current || !authenticatedRef.current || !holdings) {
            console.log('Websocket: Cannot subscribe', {
                hasSocket: !!socketRef.current,
                authenticated: authenticatedRef.current,
                hasHoldings: !!holdings
            });
            return;
        }

        const tokensToSubscribe: string[] = [];
        holdings.forEach(account => {
            account.holdings.forEach(holding => {
                // Subscription Logic: Prefer NSE if available, else take the first one
                let targetSymbol = holding.symbol.find(s => s.exchange === 'NSE');
                if (!targetSymbol && holding.symbol.length > 0) {
                    targetSymbol = holding.symbol[0];
                }

                if (targetSymbol) {
                    tokensToSubscribe.push(`${targetSymbol.exchange}|${targetSymbol.token}`);
                }
            });
        });

        if (tokensToSubscribe.length > 0) {
            const uniqueTokens = Array.from(new Set(tokensToSubscribe));
            const subscribeMessage = {
                t: 't',
                k: uniqueTokens.join('#')
            };
            console.log('Websocket: Sending Subscription Message:', subscribeMessage);
            socketRef.current.send(JSON.stringify(subscribeMessage));
        }
    }, [holdings]);

    useEffect(() => {
        if (isAuthenticated && websocketKey && clientDetails) {
            connect();
        } else {
            console.log('Websocket: Cleaning up due to logout or missing data');
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
                reconnectTimeoutRef.current = null;
            }
            if (socketRef.current) {
                socketRef.current.close();
            }
        }

        return () => {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            if (socketRef.current) {
                socketRef.current.close();
            }
        };
    }, [isAuthenticated, websocketKey, clientDetails, connect]);

    // Re-subscribe if holdings change (e.g. after refresh)
    useEffect(() => {
        if (isConnected && authenticatedRef.current) {
            subscribeToHoldings();
        }
    }, [holdings, isConnected, subscribeToHoldings]);

    return (
        <WebsocketContext.Provider value={{ isConnected, ltpData }}>
            {children}
        </WebsocketContext.Provider>
    );
};
