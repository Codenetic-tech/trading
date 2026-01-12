import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

const Breadcrumb: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Map path to display name
    const getPageName = (path: string) => {
        switch (path) {
            case '/portfolio': return 'My Portfolio';
            case '/orderbook': return 'Order Book';
            default: return 'Dashboard';
        }
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
                <div className="min-w-fit">
                    <div className="text-gray-400 text-sm">NSE</div>
                    <div className="pt-1 flex items-center gap-2">
                        <span className="font-semibold text-base">117,013.60</span>
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-[10px] py-0">
                            +8%
                        </Badge>
                    </div>
                </div>

                <div className="min-w-fit">
                    <div className="text-gray-400 text-sm">BSE</div>
                    <div className="pt-1 flex items-center gap-2">
                        <span className="font-semibold text-base">117,013.60</span>
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-[10px] py-0">
                            +8%
                        </Badge>
                    </div>
                </div>

                <div className="min-w-fit">
                    <div className="text-gray-400 text-sm">Nifty 50</div>
                    <div className="pt-1 flex items-center gap-2">
                        <span className="font-semibold text-base">2987.766</span>
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-[10px] py-0">
                            +8%
                        </Badge>
                    </div>
                </div>

                <div className="min-w-fit">
                    <div className="text-gray-400 text-sm">Nifty Bank</div>
                    <div className="pt-1 flex items-center gap-2">
                        <span className="font-semibold text-base">19,270.56</span>
                        <Badge className="bg-red-100 text-red-700 hover:bg-red-100 text-[10px] py-0">
                            -8%
                        </Badge>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Breadcrumb;
