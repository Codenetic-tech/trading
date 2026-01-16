import React, { useState, useMemo } from 'react';
import {
    Search, RefreshCcw, Info, MoreHorizontal, Plus, Mic, Send,
    ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, Wallet, User, Check, ChevronsUpDown
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useHoldings } from '@/contexts/HoldingContext';
import { useWebsocket } from '@/contexts/WebsocketContext';

const PortfolioDashboard: React.FC = () => {
    const { token, clientDetails } = useAuth();
    const { holdings, isLoading, refreshHoldings } = useHoldings();
    const { ltpData } = useWebsocket();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedAccountId, setSelectedAccountId] = useState('all');
    const [open, setOpen] = useState(false);

    const handleRefresh = async () => {
        if (!token || !clientDetails?.userId) return;
        setIsRefreshing(true);
        try {
            await refreshHoldings(token, clientDetails.userId);
        } finally {
            setIsRefreshing(false);
        }
    };

    const [isRefreshing, setIsRefreshing] = useState(false);

    const allHoldings = useMemo(() => {
        return holdings?.flatMap(h => h.holdings.map(item => {
            // Find live LTP from websocket data
            // Subscription logic preferred NSE, so we check tokens
            let liveLtp = 0;
            const symbolInfo = item.symbol.find(s => s.exchange === 'NSE') || item.symbol[0];
            if (symbolInfo) {
                const wsData = ltpData.get(symbolInfo.token);
                liveLtp = wsData ? parseFloat(wsData.lp) : parseFloat(symbolInfo.ltp);
            }

            const buyPrice = parseFloat(item.buyPrice);
            const qty = parseFloat(item.netQty);
            const investedValue = buyPrice * qty;
            const currentLtp = liveLtp;
            const unrealizedPnl = (currentLtp - buyPrice) * qty;

            return {
                ...item,
                product: h.product,
                actId: h.actId,
                liveLtp: currentLtp,
                investedValue,
                unrealizedPnlLive: unrealizedPnl,
                preClose: parseFloat(item.closePrice),
                todayPnlLive: (currentLtp - parseFloat(item.closePrice)) * qty
            };
        })) || [];
    }, [holdings, ltpData]);

    const uniqueAccounts = useMemo(() => {
        const accounts = Array.from(new Set(allHoldings.map(h => h.actId)));
        return accounts.sort();
    }, [allHoldings]);

    const filteredByAccount = useMemo(() => {
        if (selectedAccountId === 'all') return allHoldings;
        return allHoldings.filter(h => h.actId === selectedAccountId);
    }, [allHoldings, selectedAccountId]);

    const totalUnrealizedPnl = useMemo(() => {
        return filteredByAccount.reduce((acc, h) => acc + h.unrealizedPnlLive, 0);
    }, [filteredByAccount]);

    const totalInvested = useMemo(() => {
        return filteredByAccount.reduce((acc, h) => acc + h.investedValue, 0);
    }, [filteredByAccount]);

    const totalCurrentValue = useMemo(() => {
        return totalInvested + totalUnrealizedPnl;
    }, [totalInvested, totalUnrealizedPnl]);

    const totalTodayPnl = useMemo(() => {
        return filteredByAccount.reduce((acc, h) => acc + h.todayPnlLive, 0);
    }, [filteredByAccount]);

    const filteredHoldings = useMemo(() => {
        return filteredByAccount.filter(h =>
            h.symbol[0]?.tradingSymbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
            h.isin.toLowerCase().includes(searchQuery.toLowerCase()) ||
            h.actId.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [filteredByAccount, searchQuery]);

    return (
        <div className="space-y-8 mt-6">
            {/* Main Page Header */}
            <div className="relative w-full flex flex-col lg:flex-row justify-end mb-12 lg:mb-2 z-0">
                <div className="w-full lg:w-2/5 relative lg:absolute top-0 left-0 z-20 mb-8 lg:mb-0">
                    <h1 className="text-5xl lg:text-6xl mt-0 lg:-mt-4 mb-8">My Portfolio</h1>
                    {/* Overview Card */}
                    <div className="w-full lg:w-3/4 xl:w-11/12">
                        <div className="bg-white rounded-2xl p-8 px-2 shadow-sm mb-4 flex flex-col xl:flex-row items-stretch gap-6">
                            <div className="flex-1 pl-6">
                                <div className="text-2xl font-bold mb-1 text-slate-900">
                                    {totalInvested.toLocaleString('en-IN', {
                                        style: 'currency',
                                        currency: 'INR'
                                    })}
                                </div>
                                <div className="text-sm text-slate-500 font-medium whitespace-nowrap">Total Invested</div>
                            </div>

                            <Separator orientation="vertical" className="hidden xl:block h-10 self-center" />
                            <Separator orientation="horizontal" className="xl:hidden" />

                            <div className="flex-1">
                                <div className={cn(
                                    "text-2xl font-bold mb-1",
                                    totalUnrealizedPnl >= 0 ? "text-green-600" : "text-red-600"
                                )}>
                                    {totalCurrentValue.toLocaleString('en-IN', {
                                        style: 'currency',
                                        currency: 'INR'
                                    })}
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="text-sm text-slate-500 font-medium whitespace-nowrap">Current Value</div>
                                    <span className={cn(
                                        "text-[10px] font-bold",
                                        totalUnrealizedPnl >= 0 ? "text-green-600" : "text-red-600"
                                    )}>
                                        ({totalInvested > 0 ? ((totalUnrealizedPnl / totalInvested) * 100).toFixed(2) : "0.00"}%)
                                    </span>
                                </div>
                            </div>

                            <Separator orientation="vertical" className="hidden xl:block h-10 self-center" />
                            <Separator orientation="horizontal" className="xl:hidden" />

                            <div className="flex-1 pr-6">
                                <div className={cn(
                                    "text-2xl font-bold mb-1",
                                    totalTodayPnl >= 0 ? "text-green-600" : "text-red-600"
                                )}>
                                    {totalTodayPnl.toLocaleString('en-IN', {
                                        style: 'currency',
                                        currency: 'INR'
                                    })}
                                </div>
                                <div className="text-sm text-slate-500 font-medium whitespace-nowrap">Today's P&L</div>
                            </div>
                        </div>

                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden flex">
                            <div className="h-full bg-blue-600" style={{ width: '45%' }}></div>
                            <div className="h-full bg-yellow-400" style={{ width: '15%' }}></div>
                            <div className="h-full bg-purple-600" style={{ width: '10%' }}></div>
                            <div className="h-full bg-gray-300" style={{ width: '30%' }}></div>
                        </div>
                    </div>

                </div>
                {/* Decorative SVG */}
                <div className="w-full lg:w-3/5 flex justify-center items-start overflow-visible pt-8 lg:pt-0">
                    <svg viewBox="0 0 470 120" className="w-full max-w-8xl h-auto" style={{ overflow: 'visible' }}>
                        <defs>
                            <linearGradient id="circleGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#6fb9ffff" />
                                <stop offset="50%" stopColor="#d0f5ffff" />
                                <stop offset="100%" stopColor="#eaf1faff" />
                            </linearGradient>
                            <path id="circlePath" d="M 45 200 A 205 205 0 0 1 455 200" fill="none" />
                        </defs>
                        <path d="M 55 200 A 195 195 0 0 1 445 200" fill="url(#circleGradient)" opacity="0.8" />
                        <path d="M 45 200 A 205 205 0 0 1 455 200" fill="none" stroke="#6fb9ffff" strokeWidth="0.8" opacity="0.8" />
                        <g>
                            <circle r="3.5" fill="#573bf6ff">
                                <animateMotion dur="10s" repeatCount="indefinite" begin="0s"><mpath xlinkHref="#circlePath" /></animateMotion>
                            </circle>
                            <circle r="3.5" fill="#573bf6ff">
                                <animateMotion dur="10s" repeatCount="indefinite" begin="-2s"><mpath xlinkHref="#circlePath" /></animateMotion>
                            </circle>
                            <circle r="3.5" fill="#573bf6ff">
                                <animateMotion dur="10s" repeatCount="indefinite" begin="-4s"><mpath xlinkHref="#circlePath" /></animateMotion>
                            </circle>
                            <circle r="3.5" fill="#573bf6ff">
                                <animateMotion dur="10s" repeatCount="indefinite" begin="-6s"><mpath xlinkHref="#circlePath" /></animateMotion>
                            </circle>
                            <circle r="3.5" fill="#573bf6ff">
                                <animateMotion dur="10s" repeatCount="indefinite" begin="-8s"><mpath xlinkHref="#circlePath" /></animateMotion>
                            </circle>
                        </g>

                        <text x="250" y="80" textAnchor="middle" className="text-xs fill-gray-600">Total Net P&L</text>
                        <text
                            x="250" y="110"
                            textAnchor="middle"
                            className={cn(
                                "text-3xl font-bold",
                                totalUnrealizedPnl >= 0 ? "fill-green-600" : "fill-red-600"
                            )}
                        >
                            {totalUnrealizedPnl >= 0 ? "+" : ""}
                            {totalUnrealizedPnl.toLocaleString('en-IN', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            })}
                        </text>
                    </svg>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 relative z-10">
                {/* Holdings Card */}
                <div className="xl:col-span-2 bg-white rounded-3xl p-6 shadow-sm flex flex-col h-[600px]">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-4">
                            <h2 className="text-2xl font-bold text-slate-900">My Holdings</h2>
                            <Badge variant="secondary" className="bg-blue-50 text-blue-600 font-semibold px-3">
                                {filteredHoldings.length} Assets
                            </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                            <Popover open={open} onOpenChange={setOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={open}
                                        className="w-[200px] justify-between bg-slate-50 border-none rounded-xl text-slate-600 hover:text-slate-900 h-10"
                                    >
                                        <div className="flex items-center gap-2 truncate">
                                            <User className="w-3.5 h-3.5 text-slate-400" />
                                            <span className="truncate">
                                                {selectedAccountId === "all" ? "All Accounts" : selectedAccountId}
                                            </span>
                                        </div>
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[200px] p-0" align="end">
                                    <Command>
                                        <CommandInput placeholder="Search account..." />
                                        <CommandList>
                                            <CommandEmpty>No account found.</CommandEmpty>
                                            <CommandGroup>
                                                <CommandItem
                                                    onSelect={() => {
                                                        setSelectedAccountId("all")
                                                        setOpen(false)
                                                    }}
                                                    className="flex items-center justify-between"
                                                >
                                                    <div className="flex items-center">
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                selectedAccountId === "all" ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        All Accounts
                                                    </div>
                                                </CommandItem>
                                                {uniqueAccounts.map((acc) => (
                                                    <CommandItem
                                                        key={acc}
                                                        onSelect={() => {
                                                            setSelectedAccountId(acc)
                                                            setOpen(false)
                                                        }}
                                                        className="flex items-center justify-between"
                                                    >
                                                        <div className="flex items-center">
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    selectedAccountId === acc ? "opacity-100" : "opacity-0"
                                                                )}
                                                            />
                                                            {acc}
                                                        </div>
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>

                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search holdings..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-48 transition-all h-10"
                                />
                            </div>

                            <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-xl text-slate-400 hover:text-blue-600 h-10 w-10 bg-slate-50"
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                            >
                                <RefreshCcw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
                            </Button>
                        </div>
                    </div>

                    <ScrollArea className="flex-1 pr-2">
                        <div className="grid grid-cols-10 gap-4 px-2 py-3 text-[12px] font-bold text-slate-400 border-b border-slate-50 uppercase tracking-wider">
                            <div className="col-span-2">Security</div>
                            <div className="text-right">Account</div>
                            <div className="text-right">Qty</div>
                            <div className="text-right">Avg. Price</div>
                            <div className="text-right">Invested</div>
                            <div className="text-right">Pre Close</div>
                            <div className="text-right">Today's P&L</div>
                            <div className="text-right">LTP</div>
                            <div className="text-right">Net P&L</div>
                        </div>

                        <div className="space-y-1 mt-2">
                            {filteredHoldings.length > 0 ? filteredHoldings.map((holding, idx) => {
                                const symbolInfo = holding.symbol.find(s => s.exchange === 'NSE') || holding.symbol[0];
                                const pnl = holding.unrealizedPnlLive;
                                const isProfit = pnl >= 0;

                                return (
                                    <div key={holding.isin + idx}
                                        className="grid grid-cols-10 gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-all cursor-pointer group border border-transparent hover:border-slate-100 items-center"
                                    >
                                        <div className="col-span-2 flex items-center gap-3">
                                            <div className={cn(
                                                "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shadow-sm",
                                                isProfit ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                                            )}>
                                                {symbolInfo?.tradingSymbol.substring(0, 2)}
                                            </div>
                                            <div className="min-w-0 overflow-hidden">
                                                <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                                                    {symbolInfo?.tradingSymbol}
                                                    <span className="ml-2 bg-slate-100 px-1.5 py-0.5 rounded text-[9px] shrink-0">{symbolInfo?.exchange}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-right flex flex-col justify-center">
                                            <div className="text-xs font-bold text-slate-700">{holding.actId}</div>
                                        </div>

                                        <div className="text-right flex flex-col justify-center">
                                            <div className="text-xs font-bold text-slate-700">{holding.netQty}</div>
                                        </div>

                                        <div className="text-right flex flex-col justify-center">
                                            <div className="text-xs font-bold text-slate-700">₹{parseFloat(holding.buyPrice).toFixed(2)}</div>
                                        </div>

                                        <div className="text-right flex flex-col justify-center">
                                            <div className="text-xs font-bold text-slate-700 truncate">
                                                ₹{holding.investedValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </div>
                                        </div>

                                        <div className="text-right flex flex-col justify-center">
                                            <div className="text-xs font-bold text-slate-700">₹{holding.preClose.toFixed(2)}</div>
                                        </div>

                                        <div className="text-right flex flex-col justify-center">
                                            <div className={cn(
                                                "text-xs font-bold",
                                                holding.todayPnlLive >= 0 ? "text-green-600" : "text-red-600"
                                            )}>
                                                {holding.todayPnlLive >= 0 ? "+" : ""}₹{holding.todayPnlLive.toFixed(2)}
                                            </div>
                                        </div>

                                        <div className="text-right flex items-center justify-end gap-2">
                                            <div className="text-xs font-bold text-slate-900">
                                                ₹{holding.liveLtp.toFixed(2)}
                                            </div>
                                            <span className={cn(
                                                "text-[10px] font-bold flex items-center gap-0.5",
                                                isProfit ? "text-green-500" : "text-red-500"
                                            )}>
                                                {isProfit ? <ArrowUpRight className="w-2 h-2" /> : <ArrowDownRight className="w-2 h-2" />}
                                                {holding.investedValue > 0 ? ((pnl / holding.investedValue) * 100).toFixed(2) : "0.00"}%
                                            </span>
                                        </div>

                                        <div className="text-right flex flex-col justify-center">
                                            <div className={cn("text-xs font-bold", isProfit ? "text-green-600" : "text-red-600")}>
                                                {isProfit ? "+" : ""}₹{pnl.toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                );
                            }) : (
                                <div className="py-20 text-center">
                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-50 rounded-full mb-4">
                                        <Search className="w-8 h-8 text-slate-200" />
                                    </div>
                                    <p className="text-slate-400 font-medium">No holdings found for this filter</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>

                    <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between text-xs font-semibold text-slate-400">
                        <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500"></div> Market Open</span>
                            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Portfolio Synced</span>
                        </div>
                        <div className="flex gap-4 uppercase tracking-widest text-[10px]">
                            <span>Pledgable: Yes</span>
                            <span>Settlement: T+1</span>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="space-y-6">
                    {/* AI Assistant Card */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">AI Assistant</h2>
                            <MoreHorizontal className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="mb-4 p-4 bg-gray-50 rounded-xl">
                            <div className="text-sm text-gray-700 mb-4">Where should I focus trading?</div>
                            <div className="space-y-3">
                                <div className="flex items-start space-x-2">
                                    <span className="text-yellow-500">⚡</span>
                                    <div className="text-sm">
                                        <div className="font-medium mb-1">Trade Focus:</div>
                                        <ul className="space-y-1 text-gray-600">
                                            <li>• Buy & watch: SOL, LINK (short-term swing)</li>
                                            <li>• Avoid: DOGE, MATIC (high risk today)</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-4">
                            <button className="px-4 py-2 bg-gray-900 text-white text-xs rounded-full">GPT-4o</button>
                            <button className="px-4 py-2 bg-gray-100 text-gray-700 text-xs rounded-full">Financial AI</button>
                            <button className="px-4 py-2 bg-gray-100 text-gray-700 text-xs rounded-full">Candle analysis</button>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button className="p-2 hover:bg-gray-100 rounded-lg shrink-0"><Plus className="w-5 h-5 text-gray-600" /></button>
                            <input type="text" placeholder="Ask AI Assistant..." className="flex-1 min-w-0 px-4 py-2 bg-gray-50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            <button className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shrink-0"><Send className="w-5 h-5" /></button>
                        </div>
                    </div>

                    {/* Spending Overview Card */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
                                <h2 className="text-lg font-semibold">Spending Overview</h2>
                            </div>
                            <MoreHorizontal className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="mb-4">
                            <div className={cn("text-3xl font-bold mb-1", totalUnrealizedPnl >= 0 ? "text-green-600" : "text-red-600")}>
                                {totalUnrealizedPnl >= 0 ? "+" : ""}{totalUnrealizedPnl.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                            </div>
                            <div className="text-sm text-slate-500 font-medium">Net Unrealized P&L</div>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden flex">
                            <div className="h-full bg-blue-600" style={{ width: '45%' }}></div>
                            <div className="h-full bg-yellow-400" style={{ width: '15%' }}></div>
                            <div className="h-full bg-purple-600" style={{ width: '10%' }}></div>
                            <div className="h-full bg-gray-300" style={{ width: '30%' }}></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PortfolioDashboard;