import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
    Upload,
    FileText,
    Users,
    Download,
    AlertCircle,
    Search,
    FileSpreadsheet,
    X,
    BarChart3,
    TrendingUp,
    TrendingDown,
    Database,
    Calculator,
    FileCheck,
    ShieldAlert,
    ShieldCheck
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import ModernLoading from '@/components/ModernLoading';
import { SummaryCard, SummaryCardsGrid } from '@/components/SummaryCard';
import { CardDescription } from '@/components/ui/card';
import { MarginData, MarginSummary, processMarginData, exportMarginDataToExcel } from '@/utils/margincheck';

// ===================================================================
// MARGIN UPLOAD MODAL
// ===================================================================
interface MarginUploadModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onFilesSelected: (files: { viewLimits: File | null; bankEx: File | null; nseMargin: File | null }) => void;
}

const MarginUploadModal: React.FC<MarginUploadModalProps> = ({
    open,
    onOpenChange,
    onFilesSelected,
}) => {
    const [viewLimitsFile, setViewLimitsFile] = useState<File | null>(null);
    const [bankExFile, setBankExFile] = useState<File | null>(null);
    const [nseMarginFile, setNseMarginFile] = useState<File | null>(null);

    const handleFileSelect = (type: 'viewLimits' | 'bankEx' | 'nseMargin', file: File) => {
        switch (type) {
            case 'viewLimits':
                setViewLimitsFile(file);
                break;
            case 'bankEx':
                setBankExFile(file);
                break;
            case 'nseMargin':
                setNseMarginFile(file);
                break;
        }
    };

    const handleConfirm = () => {
        onFilesSelected({
            viewLimits: viewLimitsFile,
            bankEx: bankExFile,
            nseMargin: nseMarginFile
        });
        onOpenChange(false);
        setViewLimitsFile(null);
        setBankExFile(null);
        setNseMarginFile(null);
    };

    const handleCancel = () => {
        onOpenChange(false);
        setViewLimitsFile(null);
        setBankExFile(null);
        setNseMarginFile(null);
    };

    const allFilesSelected = viewLimitsFile && bankExFile && nseMarginFile;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-6xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center space-x-2">
                        <ShieldAlert className="h-5 w-5 text-blue-600" />
                        <span>Upload Margin Check Files</span>
                    </DialogTitle>
                    <DialogDescription>
                        Upload all three required files for margin calculation and analysis
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-4">
                    {/* View Limits File */}
                    <Card className="border-2 border-dashed border-slate-300 hover:border-blue-400 transition-colors">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <FileCheck className="h-5 w-5 text-blue-600" />
                                <span>View Limits File *</span>
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Excel file with Entity (A), Exchange (B), Total (G), MarginUsed (I) columns
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {viewLimitsFile ? (
                                <div className="text-center py-4">
                                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                                        <div>
                                            <p className="text-sm font-medium text-green-800">{viewLimitsFile.name}</p>
                                            <p className="text-xs text-green-600">View Limits data uploaded</p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setViewLimitsFile(null)}
                                            className="text-green-600 hover:text-green-700 h-8 w-8 p-0"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Upload className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                                    <label htmlFor="viewlimits-upload" className="cursor-pointer">
                                        <span className="text-blue-600 hover:text-blue-700 font-medium">
                                            Upload View Limits Excel
                                        </span>
                                    </label>
                                    <input
                                        id="viewlimits-upload"
                                        type="file"
                                        accept=".xlsx,.xls"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) handleFileSelect('viewLimits', file);
                                        }}
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* MCX Bancs File */}
                    <Card className="border-2 border-dashed border-slate-300 hover:border-blue-400 transition-colors">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <TrendingUp className="h-5 w-5 text-blue-600" />
                                <span>MCX Bancs File *</span>
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Excel file with Client Code (E), Total MU (Rs) (L) columns. Header at row 3
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {bankExFile ? (
                                <div className="text-center py-4">
                                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                                        <div>
                                            <p className="text-sm font-medium text-green-800">{bankExFile.name}</p>
                                            <p className="text-xs text-green-600">MCX Margin data uploaded</p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setBankExFile(null)}
                                            className="text-blue-600 hover:text-blue-700"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Upload className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                                    <label htmlFor="bankex-upload" className="cursor-pointer">
                                        <span className="text-blue-600 hover:text-blue-700 font-medium">
                                            Upload MCX Bancs Excel
                                        </span>
                                    </label>
                                    <input
                                        id="bankex-upload"
                                        type="file"
                                        accept=".xlsx,.xls"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) handleFileSelect('bankEx', file);
                                        }}
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* NSE Margin File */}
                    <Card className="border-2 border-dashed border-slate-300 hover:border-blue-400 transition-colors">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Calculator className="h-5 w-5 text-blue-600" />
                                <span>NSE Nmass File *</span>
                            </CardTitle>
                            <CardDescription className="text-xs">
                                CSV file with Client Code, Initial Margins (H), Extreme Loss Margin (K) columns
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {nseMarginFile ? (
                                <div className="text-center py-4">
                                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                                        <div>
                                            <p className="text-sm font-medium text-green-800">{nseMarginFile.name}</p>
                                            <p className="text-xs text-green-600">NSE Margin data uploaded</p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setNseMarginFile(null)}
                                            className="text-blue-600 hover:text-blue-700 h-8 w-8 p-0"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Upload className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                                    <label htmlFor="nsemargin-upload" className="cursor-pointer">
                                        <span className="text-blue-600 hover:text-blue-700 font-medium">
                                            Upload NSE Margin CSV
                                        </span>
                                    </label>
                                    <input
                                        id="nsemargin-upload"
                                        type="file"
                                        accept=".csv,.txt"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) handleFileSelect('nseMargin', file);
                                        }}
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                    <Button variant="outline" onClick={handleCancel}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={!allFilesSelected}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        <ShieldCheck className="h-4 w-4 mr-2" />
                        Process Files
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

// ===================================================================
// MARGIN TABLE
// ===================================================================
interface MarginTableProps {
    data: MarginData[];
    summary: MarginSummary | null;
    onExportToExcel?: (data: MarginData[]) => void;
}

type SortColumn = 'UCC' | 'Exchange' | 'Total' | 'MarginUsed' | 'NSEMargin' | 'MCXMargin' | 'NSEDifference' | 'MCXDifference';
type SortDirection = 'asc' | 'desc';

const MarginTable: React.FC<MarginTableProps> = ({
    data,
    summary,
    onExportToExcel
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [exchangeFilter, setExchangeFilter] = useState<string>('all');
    const [marginFilter, setMarginFilter] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortColumn, setSortColumn] = useState<SortColumn>('UCC');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
    const itemsPerPage = 100;

    const filteredData = useMemo(() => {
        let filtered = data.filter(item =>
            item.UCC.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.Name.toLowerCase().includes(searchQuery.toLowerCase())
        );

        if (exchangeFilter !== 'all') {
            filtered = filtered.filter(item => item.Exchange === exchangeFilter);
        }

        if (marginFilter === 'deficit') {
            filtered = filtered.filter(item => item.Total < item.TotalMargin);
        } else if (marginFilter === 'surplus') {
            filtered = filtered.filter(item => item.Total >= item.TotalMargin);
        } else if (marginFilter === 'zero-margin') {
            filtered = filtered.filter(item => item.TotalMargin === 0);
        }

        // Apply sorting
        filtered.sort((a, b) => {
            let aValue: any = a[sortColumn];
            let bValue: any = b[sortColumn];

            // Handle sorting for numeric columns
            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
            }

            // Handle sorting for string columns
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return sortDirection === 'asc'
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            }

            return 0;
        });

        return filtered;
    }, [data, searchQuery, exchangeFilter, marginFilter, sortColumn, sortDirection]);

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredData, currentPage]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const formatCurrency = (num: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(num);
    };

    const getMarginStatus = (total: number, required: number) => {
        const deficit = required - total;
        if (deficit > 0) {
            return { status: 'Deficit', color: 'text-red-600', bgColor: 'bg-red-50' };
        } else if (deficit === 0) {
            return { status: 'Balanced', color: 'text-amber-600', bgColor: 'bg-amber-50' };
        } else {
            return { status: 'Surplus', color: 'text-green-600', bgColor: 'bg-green-50' };
        }
    };

    const handleSort = (column: SortColumn) => {
        if (sortColumn === column) {
            // Toggle direction if same column
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            // New column, default to ascending
            setSortColumn(column);
            setSortDirection('asc');
        }
        setCurrentPage(1); // Reset to first page when sorting
    };

    const getSortIcon = (column: SortColumn) => {
        if (sortColumn !== column) return null;

        return (
            <span className="ml-1">
                {sortDirection === 'asc' ? '↑' : '↓'}
            </span>
        );
    };

    const handleExport = () => {
        if (onExportToExcel && filteredData.length > 0) {
            onExportToExcel(filteredData);
        }
    };

    return (
        <div className="space-y-6">
            {/* Table */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                        <CardTitle>Margin Analysis Results ({filteredData.length} records)</CardTitle>
                        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Search UCC or Name..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 w-full sm:w-64"
                                />
                            </div>
                            <Select value={exchangeFilter} onValueChange={setExchangeFilter}>
                                <SelectTrigger className="w-full sm:w-40">
                                    <SelectValue placeholder="Exchange" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Exchanges</SelectItem>
                                    <SelectItem value="NSE">NSE Only</SelectItem>
                                    <SelectItem value="MCX">MCX Only</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={marginFilter} onValueChange={setMarginFilter}>
                                <SelectTrigger className="w-full sm:w-40">
                                    <SelectValue placeholder="Margin Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="deficit">Deficit Only</SelectItem>
                                    <SelectItem value="surplus">Surplus Only</SelectItem>
                                    <SelectItem value="zero-margin">Zero Margin</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button
                                onClick={handleExport}
                                className="bg-emerald-600 hover:bg-emerald-700"
                                disabled={filteredData.length === 0}
                            >
                                <FileSpreadsheet className="h-4 w-4 mr-2" />
                                Export Excel
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead
                                        className="cursor-pointer hover:bg-slate-100"
                                        onClick={() => handleSort('UCC')}
                                    >
                                        UCC {getSortIcon('UCC')}
                                    </TableHead>
                                    <TableHead
                                        className="cursor-pointer hover:bg-slate-100"
                                        onClick={() => handleSort('Exchange')}
                                    >
                                        Exchange {getSortIcon('Exchange')}
                                    </TableHead>
                                    <TableHead className="text-right cursor-pointer hover:bg-slate-100"
                                        onClick={() => handleSort('Total')}
                                    >
                                        Total Exposure {getSortIcon('Total')}
                                    </TableHead>
                                    <TableHead className="text-right cursor-pointer hover:bg-slate-100"
                                        onClick={() => handleSort('MarginUsed')}
                                    >
                                        Kambala Margin {getSortIcon('MarginUsed')}
                                    </TableHead>
                                    <TableHead className="text-right cursor-pointer hover:bg-slate-100"
                                        onClick={() => handleSort('NSEMargin')}
                                    >
                                        NSE Margin {getSortIcon('NSEMargin')}
                                    </TableHead>
                                    <TableHead className="text-right cursor-pointer hover:bg-slate-100"
                                        onClick={() => handleSort('MCXMargin')}
                                    >
                                        MCX Margin {getSortIcon('MCXMargin')}
                                    </TableHead>
                                    <TableHead
                                        className="text-right cursor-pointer hover:bg-slate-100"
                                        onClick={() => handleSort('NSEDifference')}
                                    >
                                        NSE Difference {getSortIcon('NSEDifference')}
                                    </TableHead>
                                    <TableHead
                                        className="text-right cursor-pointer hover:bg-slate-100"
                                        onClick={() => handleSort('MCXDifference')}
                                    >
                                        MCX Difference {getSortIcon('MCXDifference')}
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedData.length > 0 ? (
                                    paginatedData.map((row, index) => {
                                        const marginStatus = getMarginStatus(row.Total, row.TotalMargin);
                                        const deficitSurplus = row.TotalMargin - row.Total;

                                        return (
                                            <TableRow key={`${row.UCC}-${index}`} className="hover:bg-slate-50">
                                                <TableCell className="font-mono font-medium">{row.UCC}</TableCell>
                                                <TableCell>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.Exchange === 'NSE'
                                                        ? 'bg-blue-100 text-blue-700'
                                                        : 'bg-purple-100 text-purple-700'
                                                        }`}>
                                                        {row.Exchange}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right font-mono text-sm">
                                                    {formatCurrency(row.Total)}
                                                </TableCell>
                                                <TableCell className="text-right font-mono text-sm">
                                                    {formatCurrency(row.MarginUsed)}
                                                </TableCell>
                                                <TableCell className="text-right font-mono text-sm">
                                                    {formatCurrency(row.NSEMargin)}
                                                </TableCell>
                                                <TableCell className="text-right font-mono text-sm">
                                                    {formatCurrency(row.MCXMargin)}
                                                </TableCell>
                                                <TableCell
                                                    className={`text-right font-mono text-sm ${row.NSEDifference < 0
                                                        ? 'text-red-600 font-semibold'
                                                        : row.NSEDifference > 0
                                                            ? 'text-green-600 font-semibold'
                                                            : 'text-gray-900 dark:text-gray-100'
                                                        }`}
                                                >
                                                    {formatCurrency(row.NSEDifference)}
                                                </TableCell>

                                                <TableCell
                                                    className={`text-right font-mono text-sm ${row.MCXDifference < 0
                                                        ? 'text-red-600 font-semibold'
                                                        : row.MCXDifference > 0
                                                            ? 'text-green-600 font-semibold'
                                                            : 'text-gray-900 dark:text-gray-100'
                                                        }`}
                                                >
                                                    {formatCurrency(row.MCXDifference)}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={10} className="text-center py-8 text-slate-500">
                                            {data.length === 0 ? 'Upload files to see margin data' : 'No matching records found'}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-4">
                            <div className="text-sm text-slate-600">
                                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} results
                            </div>
                            <div className="flex space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </Button>
                                <span className="flex items-center px-3 text-sm text-slate-600">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

// ===================================================================
// MAIN MARGIN CHECK COMPONENT
// ===================================================================
const MarginCheck: React.FC = () => {
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [processedData, setProcessedData] = useState<MarginData[]>([]);
    const [summary, setSummary] = useState<MarginSummary | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    const handleFilesSelected = async (files: {
        viewLimits: File | null;
        bankEx: File | null;
        nseMargin: File | null
    }) => {
        const { viewLimits, bankEx, nseMargin } = files;

        if (!viewLimits || !bankEx || !nseMargin) {
            setError('Please select all three required files');
            return;
        }

        setIsProcessing(true);
        setError(null);

        try {
            const result = await processMarginData(viewLimits, bankEx, nseMargin);

            setProcessedData(result.data);
            setSummary(result.summary);
            setIsUploadModalOpen(false);

            toast({
                title: "Files processed successfully!",
                description: `Found ${result.data.length} clients with margin data`,
                duration: 3000,
            });
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Error processing files. Please check the file format and try again.');
            toast({
                title: "Error processing files",
                description: error instanceof Error ? error.message : 'Unknown error',
                variant: "destructive",
                duration: 5000,
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleExportToExcel = (data: MarginData[]) => {
        const success = exportMarginDataToExcel(data, 'Margin_Check_Report');
        if (success) {
            toast({
                title: "Export successful!",
                description: "Margin report has been downloaded as Excel file",
                duration: 3000,
            });
        } else {
            toast({
                title: "Export failed",
                description: "Could not export to Excel",
                variant: "destructive",
                duration: 3000,
            });
        }
    };

    const formatCurrency = (num: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(num);
    };

    return (
        <div className="space-y-6 relative">
            {/* Loading Overlay */}
            {isProcessing && (
                <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
                    <ModernLoading />
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Margin Check Analysis</h1>
                    <p className="text-slate-600 mt-1">Analyze margin requirements across exchanges</p>
                </div>
                <Button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={isProcessing}
                >
                    <Upload className="h-4 w-4 mr-2" />
                    {isProcessing ? 'Processing...' : 'Upload Files'}
                </Button>
            </div>

            {/* Error Message */}
            {error && (
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="pt-6">
                        <div className="flex items-center space-x-2 text-red-700">
                            <AlertCircle className="h-4 w-4" />
                            <span>{error}</span>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Summary Cards */}
            <SummaryCardsGrid columns={5}>
                <SummaryCard
                    title="Total Clients"
                    value={summary?.totalClients || 0}
                    icon={Users}
                    color="blue"
                />

                <SummaryCard
                    title="NSE Clients"
                    value={summary?.nseClients || 0}
                    icon={TrendingUp}
                    color="green"
                />

                <SummaryCard
                    title="MCX Clients"
                    value={summary?.mcxClients || 0}
                    icon={TrendingDown}
                    color="purple"
                />

                <SummaryCard
                    title="Total NSE Difference"
                    value={summary ? formatCurrency(summary.totalNSEDifference) : '₹0'}
                    icon={Calculator}
                    color={summary?.totalNSEDifference && summary.totalNSEDifference >= 0 ? "green" : "red"}
                />

                {/* CHANGED: Total MCX Difference */}
                <SummaryCard
                    title="Total MCX Difference"
                    value={summary ? formatCurrency(summary.totalMCXDifference) : '₹0'}
                    icon={Calculator}
                    color={summary?.totalMCXDifference && summary.totalMCXDifference >= 0 ? "green" : "red"}
                />
            </SummaryCardsGrid>

            {/* Additional Summary Cards
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-blue-50 border-blue-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-blue-700 flex items-center">
                            <ShieldCheck className="h-4 w-4 mr-2" />
                            Margin Deficit
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            {summary ? `₹${summary.marginDeficit.toLocaleString('en-IN')}` : '₹0'}
                        </div>
                        <p className="text-xs text-slate-600 mt-1">Total shortfall across all clients</p>
                    </CardContent>
                </Card>

                <Card className="bg-green-50 border-green-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-green-700 flex items-center">
                            <ShieldCheck className="h-4 w-4 mr-2" />
                            Margin Surplus
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {summary ? `₹${summary.marginSurplus.toLocaleString('en-IN')}` : '₹0'}
                        </div>
                        <p className="text-xs text-slate-600 mt-1">Total excess margin available</p>
                    </CardContent>
                </Card>

                <Card className="bg-amber-50 border-amber-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-amber-700 flex items-center">
                            <Calculator className="h-4 w-4 mr-2" />
                            Coverage Ratio
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-600">
                            {summary && summary.totalMarginUsed > 0
                                ? `${((summary.totalMarginUsed / summary.totalExposure) * 100).toFixed(1)}%`
                                : '0%'}
                        </div>
                        <p className="text-xs text-slate-600 mt-1">Margin used vs total exposure</p>
                    </CardContent>
                </Card>
            </div> */}

            {/* Results Table - Always shown */}
            <MarginTable
                data={processedData}
                summary={summary}
                onExportToExcel={handleExportToExcel}
            />

            {/* Upload Modal */}
            <MarginUploadModal
                open={isUploadModalOpen}
                onOpenChange={setIsUploadModalOpen}
                onFilesSelected={handleFilesSelected}
            />
        </div>
    );
};

export default MarginCheck;