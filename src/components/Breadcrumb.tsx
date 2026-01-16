// Update in Breadcrumb.tsx
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { useWebsocket } from '@/contexts/WebsocketContext';

const Breadcrumb: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { ltpData } = useWebsocket();

    const indices = [
        { label: 'Sensex', token: '1' },
        { label: 'Bankex', token: '12' },
        { label: 'Nifty Bank', token: '26037' },
        { label: 'Nifty 50', token: '26000' },
        { label: 'Nifty Fin Service', token: '26009' },
    ];

    // Map path to display name
    const getPageName = (path: string) => {
        switch (path) {
            case '/portfolio': return 'My Portfolio';
            case '/orderbook': return 'Order Book';
            default: return 'Dashboard';
        }
    };

    // Format number with Indian numbering system
    const formatIndianNumber = (num: number | string) => {
        const val = typeof num === 'string' ? parseFloat(num) : num;
        if (isNaN(val)) return '0.00';
        return val.toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    const renderIndexItem = (label: string, token: string) => {
        const data = ltpData.get(token);
        const ltp = data?.lp || '0.00';
        const pc = data?.pc || '0.00';
        const isPositive = parseFloat(pc) >= 0;

        return (
            <div key={token} className="min-w-fit">
                <div className="text-gray-400 text-sm">{label}</div>
                <div className="pt-1 flex items-center gap-2">
                    <span className="font-semibold text-base">
                        {formatIndianNumber(ltp)}
                    </span>
                    <Badge
                        variant="secondary"
                        className={`${isPositive
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                            } text-[10px] py-0 border-none px-1.5`}
                    >
                        {isPositive ? '+' : ''}{pc}%
                    </Badge>
                </div>
            </div>
        );
    };

    return (
        <div className="flex items-center justify-between mb-8 pb-4 w-full">
            <div className="flex-shrink-0">
                <button
                    onClick={() => navigate(-1)}
                    className="group flex items-center text-gray-500 hover:text-gray-700 transition-colors"
                >
                    <span className="flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-sm mr-2
                                transition-transform duration-300 group-hover:-translate-x-1">
                        <ArrowLeft className="w-4 h-4" />
                    </span>

                    <span>
                        Dashboard/
                        <span className="font-semibold text-gray-700 ml-1">
                            {getPageName(location.pathname)}
                        </span>
                    </span>
                </button>
            </div>

            <div className="flex items-center space-x-8 text-lg overflow-x-auto no-scrollbar pb-2 md:pb-0 ml-auto justify-end">
                {indices.map(idx => renderIndexItem(idx.label, idx.token))}
            </div>
        </div>
    );
};

export default Breadcrumb;