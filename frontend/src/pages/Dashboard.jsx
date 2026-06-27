import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../services/dashboardService';
import { formatDate } from '../utils/formatters';
import { useCurrency } from '../hooks/useCurrency';
import {
  FiTrendingUp,
  FiTrendingDown,
  FiDollarSign,
  FiPieChart,
  FiArrowRight,
  FiPlus,
} from 'react-icons/fi';
import Card from '../components/shared/Card';
import LoadingSpinner from '../components/shared/LoadingSpinner';

const Dashboard = () => {
  const { formatCurrency } = useCurrency();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await dashboardService.getSummary('month');
      setSummary(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return <LoadingSpinner />;
  }

  const balance = parseFloat(summary?.totalIncome || 0) - parseFloat(summary?.totalExpenses || 0);
  const savingsRate = summary?.totalIncome > 0 
    ? ((balance / summary. totalIncome) * 100).toFixed(1)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Welcome back! Here's your financial overview.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Income */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Income</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {formatCurrency(summary?.totalIncome || 0)}
              </h3>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FiTrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        {/* Total Expenses */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Expenses</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {formatCurrency(summary?.totalExpenses || 0)}
              </h3>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <FiTrendingDown className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </Card>

        {/* Balance */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Balance</p>
              <h3 className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(balance)}
              </h3>
            </div>
            <div className={`w-12 h-12 ${balance >= 0 ? 'bg-blue-100' : 'bg-orange-100'} rounded-lg flex items-center justify-center`}>
              <FiDollarSign className={`w-6 h-6 ${balance >= 0 ?  'text-blue-600' : 'text-orange-600'}`} />
            </div>
          </div>
        </Card>

        {/* Savings Rate */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Savings Rate</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {savingsRate}%
              </h3>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FiPieChart className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Transactions & Top Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Transactions
            </h3>
            <Link
              to="/transactions"
              className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
            >
              View All
              <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {summary?.recentTransactions?.length > 0 ? (
            <div className="space-y-3">
              {summary.recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        transaction.type === 'income'
                          ? 'bg-green-100'
                          : 'bg-red-100'
                      }`}
                    >
                      <span className="text-xl">
                        {transaction.category?. icon || '💰'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {transaction.description || transaction.category?.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(transaction.date)}
                      </p>
                    </div>
                  </div>
                  <p
                    className={`font-semibold ${
                      transaction. type === 'income'
                        ? 'text-green-600'
                        :  'text-red-600'
                    }`}
                  >
                    {transaction. type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No transactions yet</p>
              <Link
                to="/transactions"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FiPlus className="w-4 h-4" />
                Add Transaction
              </Link>
            </div>
          )}
        </Card>

        {/* Top Spending Categories */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Top Spending Categories
            </h3>
            <Link
              to="/budgets"
              className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
            >
              View Budgets
              <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {summary?.expensesByCategory?.length > 0 ?  (
            <div className="space-y-4">
              {summary.expensesByCategory.map((category) => {
                const percentage = summary.totalExpenses > 0
                  ? ((category.total / summary.totalExpenses) * 100).toFixed(1)
                  : 0;

                return (
                  <div key={category.category?.id}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{category.category?.icon || '📁'}</span>
                        <span className="font-medium text-gray-900">
                          {category.category?. name || 'Uncategorized'}
                        </span>
                      </div>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(category.total)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{percentage}% of total expenses</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No expense data available</p>
            </div>
          )}
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/transactions? action=add&type=expense"
            className="flex items-center gap-3 p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-lg hover:shadow-md transition-all"
          >
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
              <FiTrendingDown className="w-5 h-5 text-white" />
            </div>
            <span className="font-medium text-gray-900">Add Expense</span>
          </Link>

          <Link
            to="/transactions?action=add&type=income"
            className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg hover:shadow-md transition-all"
          >
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <FiTrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="font-medium text-gray-900">Add Income</span>
          </Link>

          <Link
            to="/budgets"
            className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg hover:shadow-md transition-all"
          >
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <FiPieChart className="w-5 h-5 text-white" />
            </div>
            <span className="font-medium text-gray-900">Set Budget</span>
          </Link>

          <Link
            to="/reports"
            className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg hover:shadow-md transition-all"
          >
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <FiDollarSign className="w-5 h-5 text-white" />
            </div>
            <span className="font-medium text-gray-900">View Reports</span>
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;