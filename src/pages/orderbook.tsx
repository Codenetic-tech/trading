import React, { useState } from 'react';
import {
    Search, RefreshCcw, Filter, Download, Info
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const OrderBook: React.FC = () => {
    const { orders, trades, refreshOrders, refreshTrades } = useAuth();
    const [activeSection, setActiveSection] = useState<'orders' | 'trades'>('orders');
    const [searchQuery, setSearchQuery] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await Promise.all([refreshOrders(), refreshTrades()]);
        } finally {
            setIsRefreshing(false);
        }
    };

    const filteredOrders = orders?.filter(o =>
        o.tradingSymbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.orderNo.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    const filteredTrades = trades?.filter(t =>
        t.tradingSymbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.orderNo.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    const getStatusColor = (status: string) => {
        switch (status.toUpperCase()) {
            case 'COMPLETE':
            case 'FILLED':
                return 'bg-green-50 text-green-600 border-green-100';
            case 'REJECTED':
            case 'CANCELLED':
                return 'bg-red-50 text-red-600 border-red-100';
            case 'OPEN':
            case 'PENDING':
                return 'bg-blue-50 text-blue-600 border-blue-100';
            default:
                return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header Toolbar: Tabs on Left, Actions on Right */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                {/* Tabs (Left Aligned) */}
                <div className="flex gap-2 bg-slate-200/50 p-1 w-fit rounded-2xl">
                    <button
                        onClick={() => setActiveSection('orders')}
                        className={cn(
                            "px-8 py-2.5 rounded-xl text-sm font-bold transition-all",
                            activeSection === 'orders' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        Order Book
                    </button>
                    <button
                        onClick={() => setActiveSection('trades')}
                        className={cn(
                            "px-8 py-2.5 rounded-xl text-sm font-bold transition-all",
                            activeSection === 'trades' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        Trade Book
                    </button>
                </div>

                {/* Actions (Right Aligned) */}
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by symbol or order ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 pr-4 py-3 bg-white border-none rounded-2xl text-sm shadow-sm focus:ring-2 focus:ring-blue-100 w-80 transition-all outline-none"
                        />
                    </div>
                    <Button variant="outline" className="rounded-2xl bg-white border-none shadow-sm px-6 font-semibold gap-2">
                        <Filter className="w-4 h-4" />
                        Filter
                    </Button>
                    <Button variant="outline" className="rounded-2xl bg-white border-none shadow-sm px-4 font-semibold">
                        <Download className="w-4 h-4" />
                    </Button>
                    <Button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-lg px-6 font-semibold gap-2"
                    >
                        <RefreshCcw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
                        {isRefreshing ? 'Refreshing...' : 'Refresh'}
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="mx-auto space-y-6">

                {/* List Container */}
                <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 min-h-[600px] flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">
                                {activeSection === 'orders' ? 'Current Orders' : 'Trade History'}
                            </h2>
                            <p className="text-slate-400 text-sm mt-1">
                                {activeSection === 'orders' ? `Showing ${filteredOrders.length} pending and processed orders` : `Showing ${filteredTrades.length} executed trades`}
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Trading Segment</span>
                                <span className="text-sm font-bold text-slate-900">NSE / BSE / MCX</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto">
                        <table className="w-full text-left border-separate border-spacing-y-2">
                            <thead>
                                <tr className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                    <th className="px-4 pb-4">Instrument</th>
                                    <th className="px-4 pb-4">Type</th>
                                    <th className="px-4 pb-4">Qty / Filled</th>
                                    <th className="px-4 pb-4">Price / Avg</th>
                                    <th className="px-4 pb-4">Status</th>
                                    <th className="px-4 pb-4 text-right">Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {activeSection === 'orders' ? (
                                    filteredOrders.length > 0 ? filteredOrders.map((order, i) => (
                                        <tr key={order.orderNo + i} className="group hover:bg-slate-50 transition-colors">
                                            <td className="px-4 py-4 rounded-l-2xl">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs",
                                                        order.transType === 'B' ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                                                    )}>
                                                        {order.transType === 'B' ? 'BUY' : 'SELL'}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-900">{order.tradingSymbol}</div>
                                                        <div className="text-[10px] font-bold text-slate-400 flex items-center gap-2">
                                                            <span className="bg-slate-100 px-1.5 py-0.5 rounded uppercase">{order.exchange}</span>
                                                            ID: {order.orderNo}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="text-sm font-bold text-slate-700">{order.product}</div>
                                                <div className="text-[10px] font-medium text-slate-400">{order.priceType}</div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="text-sm font-bold text-slate-900">{order.qty}</div>
                                                <div className="text-[10px] font-medium text-slate-400">Filled: {order.fillShares}</div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="text-sm font-bold text-slate-900">₹{parseFloat(order.price).toFixed(2)}</div>
                                                <div className="text-[10px] font-medium text-slate-400">Avg: {order.avgTradePrice || '0.00'}</div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <Badge className={cn(
                                                    "px-3 py-1 rounded-lg border font-bold text-[10px] uppercase tracking-wider",
                                                    getStatusColor(order.orderStatus)
                                                )}>
                                                    {order.orderStatus}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-4 text-right rounded-r-2xl">
                                                <div className="text-xs font-bold text-slate-900">{order.orderTime.split(' ')[0]}</div>
                                                <div className="text-[10px] font-medium text-slate-400">{order.orderTime.split(' ')[1]}</div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={6} className="py-20 text-center">
                                                <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-50 rounded-full mb-4 text-slate-200">
                                                    <Info className="w-8 h-8" />
                                                </div>
                                                <p className="text-slate-400 font-medium tracking-tight">No orders found in your book</p>
                                            </td>
                                        </tr>
                                    )
                                ) : (
                                    filteredTrades.length > 0 ? filteredTrades.map((trade, i) => (
                                        <tr key={trade.fillId + i} className="group hover:bg-slate-50 transition-colors">
                                            <td className="px-4 py-4 rounded-l-2xl">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs",
                                                        trade.transType === 'B' ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                                                    )}>
                                                        {trade.transType === 'B' ? 'BUY' : 'SELL'}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-900">{trade.tradingSymbol}</div>
                                                        <div className="text-[10px] font-bold text-slate-400 flex items-center gap-2">
                                                            <span className="bg-slate-100 px-1.5 py-0.5 rounded uppercase">{trade.exchange}</span>
                                                            ID: {trade.fillId}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="text-sm font-bold text-slate-700">{trade.product}</div>
                                                <div className="text-[10px] font-medium text-slate-400">{trade.orderType}</div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="text-sm font-bold text-slate-900">{trade.qty}</div>
                                                <div className="text-[10px] font-medium text-slate-400">Filled Qty: {trade.fillqty}</div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="text-sm font-bold text-slate-900">₹{parseFloat(trade.fillprc).toFixed(2)}</div>
                                                <div className="text-[10px] font-medium text-slate-400">Order Prc: {trade.price}</div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <Badge className="bg-green-50 text-green-600 border-green-100 px-3 py-1 rounded-lg border font-bold text-[10px] uppercase tracking-wider">
                                                    EXECUTED
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-4 text-right rounded-r-2xl">
                                                <div className="text-xs font-bold text-slate-900">{trade.fillTime.split(' ')[0]}</div>
                                                <div className="text-[10px] font-medium text-slate-400">{trade.fillTime.split(' ')[1]}</div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={6} className="py-20 text-center">
                                                <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-50 rounded-full mb-4 text-slate-200">
                                                    <Info className="w-8 h-8" />
                                                </div>
                                                <p className="text-slate-400 font-medium tracking-tight">No trade executions found</p>
                                            </td>
                                        </tr>
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Stats Footer (Optional Enhancement) */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Total Executed</div>
                        <div className="text-2xl font-bold text-slate-900">{trades?.length || 0}</div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Rejected Orders</div>
                        <div className="text-2xl font-bold text-red-600">
                            {orders?.filter(o => o.orderStatus === 'REJECTED').length || 0}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderBook;
