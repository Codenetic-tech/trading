import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface HoldingSymbol {
    exchange: string;
    token: string;
    tradingSymbol: string;
    pdc: string;
    ltp: string;
}

export interface HoldingItem {
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
    closePrice: string;
    symbol: HoldingSymbol[];
}

export interface HoldingResult {
    actId: string;
    poa: boolean;
    product: string;
    holdings: HoldingItem[];
}

interface HoldingContextType {
    holdings: HoldingResult[] | null;
    isLoading: boolean;
    fetchHoldings: (bearerToken: string, userId: string) => Promise<void>;
    refreshHoldings: (token: string, userId: string) => Promise<void>;
    clearHoldings: () => void;
}

const HoldingContext = createContext<HoldingContextType | undefined>(undefined);

export const useHoldings = () => {
    const context = useContext(HoldingContext);
    if (context === undefined) {
        throw new Error('useHoldings must be used within a HoldingProvider');
    }
    return context;
};

export const HoldingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [holdings, setHoldings] = useState<HoldingResult[] | null>(() => {
        const saved = localStorage.getItem('userHoldings');
        return saved ? JSON.parse(saved) : null;
    });
    const [isLoading, setIsLoading] = useState(false);

    const fetchHoldings = useCallback(async (bearerToken: string, userId: string) => {
        setIsLoading(true);
        try {
            const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
            const apiUrl = `${API_BASE_URL}/api/method/rms.sso.fetch_team_holdings`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                mode: 'cors',
                body: JSON.stringify({
                    "actid": userId
                }),
            });

            const data = await response.json();

            if (data.message && data.message.stat === 'Ok' && data.message.data) {
                const transformedResults: HoldingResult[] = data.message.data.map((account: any) => ({
                    actId: account.actid,
                    poa: true,
                    product: 'CNC',
                    holdings: account.holdings.map((h: any) => {
                        const ltp = parseFloat(h.close_prc) / 100;
                        const buyPrice = parseFloat(h.upload_prc);
                        const qty = parseFloat(h.npoadqty) || parseFloat(h.hold_qty);
                        const unrealizedPnl = (ltp - buyPrice) * qty;

                        return {
                            isin: h.isin,
                            realizedPnl: "0",
                            unrealizedPnl: unrealizedPnl.toString(),
                            netPnl: unrealizedPnl.toString(),
                            netQty: qty.toString(),
                            buyPrice: h.upload_prc,
                            holdQty: h.hold_qty,
                            dpQty: "0",
                            benQty: h.benqty,
                            unpledgedQty: "0",
                            collateralQty: "0",
                            brkCollQty: "0",
                            btstQty: "0",
                            usedQty: h.usedqty,
                            tradedQty: h.trdqty,
                            sellableQty: qty.toString(),
                            authQty: "0",
                            sellAmount: h.sell_amt,
                            authFlag: false,
                            closePrice: (parseFloat(h.close_prc) / 100).toString(),
                            symbol: h.exch_tsym.map((tsym: any) => ({
                                exchange: tsym.exch,
                                token: tsym.token,
                                tradingSymbol: tsym.tsym,
                                pdc: "0",
                                ltp: ltp.toString()
                            }))
                        };
                    })
                }));

                setHoldings(transformedResults);
                localStorage.setItem('userHoldings', JSON.stringify(transformedResults));
            }
        } catch (error) {
            console.error('Error fetching holdings:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const refreshHoldings = useCallback(async (token: string, userId: string) => {
        await fetchHoldings(token, userId);
    }, [fetchHoldings]);

    const clearHoldings = useCallback(() => {
        setHoldings(null);
        localStorage.removeItem('userHoldings');
    }, []);

    return (
        <HoldingContext.Provider value={{
            holdings,
            isLoading,
            fetchHoldings,
            refreshHoldings,
            clearHoldings
        }}>
            {children}
        </HoldingContext.Provider>
    );
};
