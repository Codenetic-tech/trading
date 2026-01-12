import React, { useState } from 'react';
import {
    Search, RefreshCcw, Info, MoreHorizontal, Plus, Mic, Send,
    ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const PortfolioDashboard: React.FC = () => {
    const { holdings, refreshHoldings } = useAuth();
    const [activeTab, setActiveTab] = useState<'Year' | 'Month' | 'Week' | 'Day'>('Month');
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await refreshHoldings();
        } finally {
            setIsRefreshing(false);
        }
    };

    const totalUnrealizedPnl = holdings?.reduce((acc, result) => {
        return acc + result.holdings.reduce((hAcc, h) => hAcc + parseFloat(h.unrealizedPnl), 0);
    }, 0) || 0;

    const [searchQuery, setSearchQuery] = useState('');

    const allHoldings = holdings?.flatMap(h => h.holdings.map(item => ({
        ...item,
        product: h.product
    }))) || [];

    const filteredHoldings = allHoldings.filter(h =>
        h.symbol[0]?.tradingSymbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.isin.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8">
            {/* Main Page */}
            <div className="relative w-full flex justify-end mb-2 z-0 mt-10">
                <div className="w-2/5 absolute top-0 left-0 z-10">
                    <h1 className="text-6xl -mt-10 mb-8">My Portfolio</h1>
                    {/* Spending Overview Card */}
                    <div className="w-1/2">

                        <div className="bg-white rounded-2xl p-6 shadow-sm mb-4">
                            <div className={cn(
                                "text-3xl font-bold mb-1",
                                totalUnrealizedPnl >= 0 ? "text-green-600" : "text-red-600"
                            )}>
                                {totalUnrealizedPnl >= 0 ? "+" : ""}
                                {totalUnrealizedPnl.toLocaleString('en-IN', {
                                    style: 'currency',
                                    currency: 'INR'
                                })}
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
                <div className="w-3/5 flex justify-center items-start">
                    <svg viewBox="0 0 470 120" className="w-full max-w-8xl h-auto" style={{ overflow: 'visible' }}>
                        <defs>
                            <linearGradient id="circleGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#6fb9ffff" />
                                <stop offset="50%" stopColor="#d0f5ffff" />
                                <stop offset="100%" stopColor="#eaf1faff" />
                            </linearGradient>
                            {/* Define the animation path for dots - Upper Arc */}
                            <path
                                id="circlePath"
                                d="M 45 200 A 205 205 0 0 1 455 200"
                                fill="none"
                            />
                        </defs>

                        {/* Main Half Circle with Gradient */}
                        <path
                            d="M 55 200 A 195 195 0 0 1 445 200"
                            fill="url(#circleGradient)"
                            opacity="0.8"
                        />


                        {/* Outer Arc - Above the half circle for dots to circle */}
                        <path
                            d="M 45 200 A 205 205 0 0 1 455 200"
                            fill="none"
                            stroke="#6fb9ffff"
                            strokeWidth="0.8"
                            opacity="0.8"
                        />

                        {/* Animated Dots Circling the Arc - Using motionPath */}
                        <g>
                            <circle r="3.5" fill="#573bf6ff">
                                <animateMotion dur="10s" repeatCount="indefinite" begin="0s">
                                    <mpath xlinkHref="#circlePath" />
                                </animateMotion>
                            </circle>

                            <circle r="3.5" fill="#573bf6ff">
                                <animateMotion dur="10s" repeatCount="indefinite" begin="-2s">
                                    <mpath xlinkHref="#circlePath" />
                                </animateMotion>
                            </circle>

                            <circle r="3.5" fill="#573bf6ff">
                                <animateMotion dur="10s" repeatCount="indefinite" begin="-4s">
                                    <mpath xlinkHref="#circlePath" />
                                </animateMotion>
                            </circle>

                            <circle r="3.5" fill="#573bf6ff">
                                <animateMotion dur="10s" repeatCount="indefinite" begin="-6s">
                                    <mpath xlinkHref="#circlePath" />
                                </animateMotion>
                            </circle>

                            <circle r="3.5" fill="#573bf6ff">
                                <animateMotion dur="10s" repeatCount="indefinite" begin="-8s">
                                    <mpath xlinkHref="#circlePath" />
                                </animateMotion>
                            </circle>
                        </g>

                        {/* Text in the center */}
                        <text x="250" y="80" textAnchor="middle" className="text-xs fill-gray-600">
                            Total Portfolio Value
                        </text>
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
            <div className="grid grid-cols-3 gap-6 relative z-10">
                {/* Holdings Card */}
                <div className="col-span-2 bg-white rounded-3xl p-6 shadow-sm flex flex-col h-[600px]">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <h2 className="text-xl font-bold text-slate-900">My Holdings</h2>
                            <Badge variant="secondary" className="bg-blue-50 text-blue-600 font-semibold px-3">
                                {allHoldings.length} Assets
                            </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search stocks..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-100 w-64 transition-all"
                                />
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-xl text-slate-400 hover:text-blue-600"
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                            >
                                <RefreshCcw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
                            </Button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto pr-2 custom-scrollbar">
                        <div className="grid grid-cols-6 gap-4 px-2 py-3 text-xs font-bold text-slate-400 border-b border-slate-50 uppercase tracking-wider">
                            <div className="col-span-2">Security</div>
                            <div className="text-right">Qty</div>
                            <div className="text-right">Avg. Price</div>
                            <div className="text-right">LTP</div>
                            <div className="text-right">Net P&L</div>
                        </div>

                        <div className="space-y-1 mt-2">
                            {filteredHoldings.length > 0 ? filteredHoldings.map((holding, idx) => {
                                const symbolInfo = holding.symbol[0];
                                const pnl = parseFloat(holding.unrealizedPnl);
                                const isProfit = pnl >= 0;

                                return (
                                    <div key={holding.isin + idx}
                                        className="grid grid-cols-6 gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-all cursor-pointer group border border-transparent hover:border-slate-100"
                                    >
                                        <div className="col-span-2 flex items-center gap-3">
                                            <div className={cn(
                                                "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shadow-sm",
                                                isProfit ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                                            )}>
                                                {symbolInfo?.tradingSymbol.substring(0, 2)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                                    {symbolInfo?.tradingSymbol}
                                                </div>
                                                <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                                                    <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[9px]">{symbolInfo?.exchange}</span>
                                                    {holding.isin}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-right flex flex-col justify-center">
                                            <div className="text-sm font-bold text-slate-700">{holding.netQty}</div>
                                            <div className="text-[10px] text-slate-400 font-medium">{holding.product}</div>
                                        </div>

                                        <div className="text-right flex flex-col justify-center">
                                            <div className="text-sm font-bold text-slate-700">₹{parseFloat(holding.buyPrice).toFixed(2)}</div>
                                            <div className="text-[10px] text-slate-400 font-medium flex flex-col">
                                                <span>Auth: {holding.authQty}</span>
                                            </div>
                                        </div>

                                        <div className="text-right flex flex-col justify-center">
                                            <div className="text-sm font-bold text-slate-900">₹{parseFloat(symbolInfo?.ltp || "0").toFixed(2)}</div>
                                            <div className={cn(
                                                "text-[10px] font-bold flex items-center justify-end gap-0.5",
                                                isProfit ? "text-green-500" : "text-red-500"
                                            )}>
                                                {isProfit ? <ArrowUpRight className="w-2 w-2" /> : <ArrowDownRight className="w-2 w-2" />}
                                                {((pnl / (parseFloat(holding.buyPrice) * parseFloat(holding.netQty))) * 100).toFixed(2)}%
                                            </div>
                                        </div>

                                        <div className="text-right flex flex-col justify-center">
                                            <div className={cn(
                                                "text-sm font-bold",
                                                isProfit ? "text-green-600" : "text-red-600"
                                            )}>
                                                {isProfit ? "+" : ""}₹{pnl.toFixed(2)}
                                            </div>
                                            <div className="text-[10px] text-slate-400 font-medium">Total Returns</div>
                                        </div>
                                    </div>
                                );
                            }) : (
                                <div className="py-20 text-center">
                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-50 rounded-full mb-4">
                                        <Search className="w-8 h-8 text-slate-200" />
                                    </div>
                                    <p className="text-slate-400 font-medium">No holdings found on your account</p>
                                </div>
                            )}
                        </div>
                    </div>

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

                        <div className="flex space-x-2 mb-4">
                            <button className="px-4 py-2 bg-gray-900 text-white text-xs rounded-full">GPT-4o</button>
                            <button className="px-4 py-2 bg-gray-100 text-gray-700 text-xs rounded-full">Document AI</button>
                            <button className="px-4 py-2 bg-gray-100 text-gray-700 text-xs rounded-full">Financial AI</button>
                            <button className="px-4 py-2 bg-gray-100 text-gray-700 text-xs rounded-full">Candle analysis</button>
                        </div>

                        <div className="flex items-center space-x-2">
                            <button className="p-2 hover:bg-gray-100 rounded-lg">
                                <Plus className="w-5 h-5 text-gray-600" />
                            </button>
                            <input
                                type="text"
                                placeholder="Enter Task for AI Assistant"
                                className="flex-1 px-4 py-2 bg-gray-50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button className="p-2 hover:bg-gray-100 rounded-lg">
                                <Mic className="w-5 h-5 text-gray-600" />
                            </button>
                            <button className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                <Send className="w-5 h-5" />
                            </button>
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
                            <div className={cn(
                                "text-3xl font-bold mb-1",
                                totalUnrealizedPnl >= 0 ? "text-green-600" : "text-red-600"
                            )}>
                                {totalUnrealizedPnl >= 0 ? "+" : ""}
                                {totalUnrealizedPnl.toLocaleString('en-IN', {
                                    style: 'currency',
                                    currency: 'INR'
                                })}
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