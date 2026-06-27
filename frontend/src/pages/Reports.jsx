import { useState, useEffect } from 'react';
import { dashboardService } from '../services/dashboardService';
import { transactionService } from '../services/transactionService';
import { reportService } from '../services/reportService';
import { useCurrency } from '../hooks/useCurrency';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import {
  FiTrendingUp,
  FiTrendingDown,
  FiDollarSign,
  FiPieChart,
  FiCalendar,
  FiDownload,
} from 'react-icons/fi';
import Card from '../components/shared/Card';
import LoadingSpinner from '../components/shared/LoadingSpinner';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Reports = () => {
  const { formatCurrency } = useCurrency();
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');
  const [chartType, setChartType] = useState('line');

  useEffect(() => {
    fetchReportData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const [summaryRes, transactionsRes, trendRes] = await Promise.all([
        dashboardService.getSummary(period),
        transactionService.getTransactions(),
        reportService.getTrend(period),
      ]);
      setSummary(summaryRes.data);
      setTransactions(transactionsRes.data);
      setTrendData(trendRes.data || []);
    } catch (error) {
      console.error('Failed to fetch report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (transactions.length === 0) return;

    const escape = (val) => `"${String(val).replace(/"/g, '""')}"`;

    const headers = ['Date', 'Type', 'Category', 'Amount', 'Description'].map(escape).join(',');
    const rows = transactions.map((t) => [
      escape(new Date(t.date).toLocaleDateString('en-US')),
      escape(t.type),
      escape(t.category?.name || 'N/A'),
      escape(t.amount),
      escape(t.description || ''),
    ].join(',')).join('\n');

    const csv = `${headers}\n${rows}`;

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document. createElement('a');
    a.href = url;
    a. download = `transactions-${period}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  // Prepare data for charts
  const categoryData = summary?.expensesByCategory || [];
  const categoryLabels = categoryData.map((c) => c.category?.name || 'Unknown');
  const categoryAmounts = categoryData.map((c) => parseFloat(c.total));

  const periods = trendData.map((d) => d.label);
  const incomeData = trendData.map((d) => d.income);
  const expenseData = trendData.map((d) => d.expenses);

  // Line Chart Data
  const lineChartData = {
    labels:  periods,
    datasets: [
      {
        label: 'Income',
        data: incomeData,
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Expenses',
        data: expenseData,
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Bar Chart Data
  const barChartData = {
    labels: periods,
    datasets: [
      {
        label: 'Income',
        data: incomeData,
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
      },
      {
        label: 'Expenses',
        data: expenseData,
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
      },
    ],
  };

  // Pie Chart Data (Categories)
  const pieChartData = {
    labels: categoryLabels,
    datasets: [
      {
        data: categoryAmounts,
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(251, 146, 60, 0.8)',
          'rgba(234, 179, 8, 0.8)',
        ],
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins:  {
      legend: {
        position: 'bottom',
      },
      tooltip:  {
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += formatCurrency(context.parsed.y);
            }
            return label;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        suggestedMax: Math.max(...incomeData, ...expenseData, 10) * 1.2,
        ticks: {
          callback: function (value) {
            return '$' + value;
          },
        },
      },
    },
  };

  const balance = parseFloat(summary?.totalIncome || 0) - parseFloat(summary?.totalExpenses || 0);
  const savingsRate = summary?.totalIncome > 0
    ? ((balance / parseFloat(summary. totalIncome)) * 100).toFixed(1)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">
            Visualize your financial data and trends
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Period Selector */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPeriod('week')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                period === 'week'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover: bg-gray-50'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setPeriod('month')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                period === 'month'
                  ?  'bg-blue-600 text-white'
                  :  'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setPeriod('year')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                period === 'year'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Year
            </button>
          </div>

          {/* Export Button */}
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <FiDownload className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Income</p>
            <FiTrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(summary?.totalIncome || 0)}
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Expenses</p>
            <FiTrendingDown className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(summary?.totalExpenses || 0)}
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Net Balance</p>
            <FiDollarSign className="w-5 h-5 text-blue-600" />
          </div>
          <p className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' :  'text-red-600'}`}>
            {formatCurrency(balance)}
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Savings Rate</p>
            <FiPieChart className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {savingsRate}%
          </p>
        </Card>
      </div>

      {/* Chart Type Selector */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Income vs Expenses Trend
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setChartType('line')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                chartType === 'line'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Line
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                chartType === 'bar'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Bar
            </button>
          </div>
        </div>

        <div className="h-80">
          {chartType === 'line' ? (
            <Line data={lineChartData} options={chartOptions} />
          ) : (
            <Bar data={barChartData} options={chartOptions} />
          )}
        </div>
      </Card>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Spending by Category
          </h3>
          <div className="h-80 flex items-center justify-center">
            {categoryData.length > 0 ? (
              <Pie data={pieChartData} options={{ responsive: true, maintainAspectRatio: true, scales: {}, plugins: { legend: { position: 'bottom' }, tooltip: { callbacks: { title: () => '', label: (ctx) => `${ctx.label}: ${formatCurrency(ctx.parsed)}` } } } }} />
            ) : (
              <p className="text-gray-500">No expense data available</p>
            )}
          </div>
        </Card>

        {/* Doughnut Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Category Distribution
          </h3>
          <div className="h-80 flex items-center justify-center">
            {categoryData.length > 0 ? (
              <Doughnut data={pieChartData} options={{ responsive: true, maintainAspectRatio: true, scales: {}, plugins: { legend: { position: 'bottom' }, tooltip: { callbacks: { title: () => '', label: (ctx) => `${ctx.label}: ${formatCurrency(ctx.parsed)}` } } } }} />
            ) : (
              <p className="text-gray-500">No expense data available</p>
            )}
          </div>
        </Card>
      </div>

      {/* Top Spending Categories Table */}
      {categoryData.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top Spending Categories
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Category
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                    Amount
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                    % of Total
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                    Transactions
                  </th>
                </tr>
              </thead>
              <tbody>
                {categoryData.map((cat, index) => {
                  const percentage = parseFloat(summary?.totalExpenses) > 0
                    ? ((parseFloat(cat.total) / parseFloat(summary.totalExpenses)) * 100).toFixed(1)
                    : 0;

                  return (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{cat.category?.icon || '📁'}</span>
                          <span className="font-medium text-gray-900">
                            {cat.category?. name || 'Uncategorized'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-gray-900">
                        {formatCurrency(cat.total)}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-600">
                        {percentage}%
                      </td>
                      <td className="py-3 px-4 text-right text-gray-600">
                        {cat.count || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Reports;