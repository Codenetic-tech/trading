import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SummaryTotals {
  totalBuyValue: number;
  totalSellValue: number;
  totalValue: number;
  totalOrders: number;
  totalClients: number;
}

interface ReportSummaryProps {
  summaryTotals: SummaryTotals;
}

const ReportSummary: React.FC<ReportSummaryProps> = ({ summaryTotals }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
      <Card className="shadow-sm border-blue-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-blue-600">Total Buy Value</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-700">
            {summaryTotals.totalBuyValue > 0 
              ? `${(summaryTotals.totalBuyValue / 100000).toFixed(2)} L` 
              : '0.00 L'}
          </div>
        </CardContent>
      </Card>
      <Card className="shadow-sm border-green-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-green-600">Total Sell Value</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-700">
            {summaryTotals.totalSellValue > 0 
              ? `${(summaryTotals.totalSellValue / 100000).toFixed(2)} L` 
              : '0.00 L'}
          </div>
        </CardContent>
      </Card>
      <Card className="shadow-sm border-purple-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-purple-600">Total Trade Value</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-700">
            {summaryTotals.totalValue > 0 
              ? `${(summaryTotals.totalValue / 100000).toFixed(2)} L` 
              : '0.00 L'}
          </div>
        </CardContent>
      </Card>
      <Card className="shadow-sm border-orange-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-orange-600">Total Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-700">
            {summaryTotals.totalOrders > 0 
              ? `${summaryTotals.totalOrders}` 
              : '0'}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportSummary;