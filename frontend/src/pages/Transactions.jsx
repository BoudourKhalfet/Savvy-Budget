import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { transactionService } from '../services/transactionService';
import { categoryService } from '../services/categoryService';
import { formatDate } from '../utils/formatters';
import { useCurrency } from '../hooks/useCurrency';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiFilter,
  FiX,
  FiCalendar,
  FiDollarSign,
} from 'react-icons/fi';
import Card from '../components/shared/Card';
import Button from '../components/shared/Button';
import Input from '../components/shared/Input';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import ConfirmDialog from '../components/shared/ConfirmDialog';

const Transactions = () => {
  const { formatCurrency } = useCurrency();
  const [searchParams, setSearchParams] = useSearchParams();
  const [transactions, setTransactions] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, id: null });
  const [allTransactions, setAllTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    search: '',
  });

  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    categoryId: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    isRecurring: false,
    recurrenceType: 'monthly_day',
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchTransactions();
    fetchCategories();

    // Check if we should open modal from URL
    const action = searchParams. get('action');
    const type = searchParams.get('type');
    if (action === 'add') {
      setFormData((prev) => ({ ...prev, type: type || 'expense' }));
      setShowModal(true);
    }
  }, [searchParams]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await transactionService.getTransactions();
      setAllTransactions(response.data);
      setTransactions(response.data);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  // Apply filters locally
  useEffect(() => {
    let filtered = [... allTransactions];

    // Filter by type
    if (filters. type) {
      filtered = filtered.filter((t) => t.type === filters.type);
    }

    // Filter by category
    if (filters.category) {
      filtered = filtered.filter(
        (t) => t.categoryId === parseInt(filters.category)
      );
    }

    // Filter by search (description or category name)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.description?. toLowerCase().includes(searchLower) ||
          t.category?.name?.toLowerCase().includes(searchLower)
      );
    }

    setTransactions(filtered);
  }, [filters, allTransactions]);

  const handleOpenModal = (transaction = null) => {
    if (transaction) {
      setEditingTransaction(transaction);
      setFormData({
        type:  transaction.type,
        amount: transaction.amount,
        categoryId: transaction.categoryId,
        description: transaction.description || '',
        date: new Date(transaction.date).toISOString().split('T')[0],
        isRecurring: transaction.isRecurring || false,
        recurrenceType: transaction.recurrenceType || 'monthly_day',
      });
    } else {
      setEditingTransaction(null);
      setFormData({
        type: 'expense',
        amount: '',
        categoryId: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        isRecurring: false,
        recurrenceType: 'monthly_day',
      });
    }
    setFormErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTransaction(null);
    setFormErrors({});
    // Clear URL params
    setSearchParams({});
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const errors = {};

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      errors.amount = 'Amount must be greater than 0';
    }

    if (!formData.categoryId) {
      errors.categoryId = 'Please select a category';
    }

    if (!formData.date) {
      errors.date = 'Date is required';
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const dataToSubmit = {
        ...formData,
        amount: parseFloat(formData.amount),
        categoryId: parseInt(formData.categoryId),
      };

      if (editingTransaction) {
        await transactionService.updateTransaction(
          editingTransaction.id,
          dataToSubmit
        );
      } else {
        await transactionService.createTransaction(dataToSubmit);
      }

      handleCloseModal();
      fetchTransactions();
    } catch (error) {
      console.error('Failed to save transaction:', error);
      setFormErrors({
        submit: error.response?.data?.message || 'Failed to save transaction',
      });
    }
  };

  const handleDelete = (id) => {
    setConfirmDialog({ isOpen: true, id });
  };

  const confirmDelete = async () => {
    const id = confirmDialog.id;
    setConfirmDialog({ isOpen: false, id: null });

    try {
      await transactionService.deleteTransaction(id);
      fetchTransactions();
    } catch (error) {
      console.error('Failed to delete transaction:', error);
      alert('Failed to delete transaction');
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      type:  '',
      category: '',
      search: '',
    });
  };

  const filteredCategories = categories.filter(
    (cat) => cat.type === formData.type
  );

  const hasActiveFilters = filters.type || filters.category || filters.search;

  if (loading && transactions.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-600 mt-1">
            Manage your income and expenses
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2"
        >
          <FiPlus className="w-5 h-5" />
          Add Transaction
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FiFilter className="w-5 h-5" />
            Filters
          </h3>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              <FiX className="w-4 h-4" />
              Clear Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="input"
            >
              <option value="">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="input"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <Input
              type="text"
              placeholder="Search by description..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              icon={<FiSearch className="text-gray-400" />}
            />
          </div>
        </div>

        {/* Results count */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-900">{transactions.length}</span> of{' '}
            <span className="font-semibold text-gray-900">{allTransactions.length}</span> transactions
          </p>
        </div>
      </Card>

      {/* Transactions List */}
      <Card className="p-6">
        {transactions.length > 0 ? (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors gap-2"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center text-xl flex-shrink-0 ${
                      transaction.type === 'income'
                        ? 'bg-green-100'
                        : 'bg-red-100'
                    }`}
                  >
                    {transaction.category?.icon || '💰'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                        {transaction.description ||
                          transaction.category?.name ||
                          'Transaction'}
                      </h4>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          transaction.type === 'income'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {transaction.type}
                      </span>
                      {transaction.isRecurring && (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
                          🔄 {transaction.recurrenceType === 'every_30_days' ? 'Every 30 days' : 'Monthly'}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {transaction.category?.name} • {formatDate(transaction.date)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <p
                    className={`text-sm sm:text-base font-bold tabular-nums ${
                      transaction.type === 'income'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </p>

                  <div className="flex items-center">
                    <button
                      onClick={() => handleOpenModal(transaction)}
                      className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit transaction"
                    >
                      <FiEdit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(transaction.id)}
                      className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete transaction"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiDollarSign className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {hasActiveFilters ? 'No matching transactions' : 'No transactions yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {hasActiveFilters
                ? 'Try adjusting your filters to see more results'
                : 'Start tracking your finances by adding your first transaction'}
            </p>
            {! hasActiveFilters && (
              <Button
                variant="primary"
                onClick={() => handleOpenModal()}
                className="inline-flex items-center gap-2"
              >
                <FiPlus className="w-5 h-5" />
                Add Your First Transaction
              </Button>
            )}
          </div>
        )}
      </Card>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingTransaction ? 'Edit Transaction' :  'Add Transaction'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {formErrors.submit && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {formErrors. submit}
                  </div>
                )}

                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, type: 'expense', categoryId: '' }))
                      }
                      className={`p-3 rounded-lg font-medium transition-all ${
                        formData.type === 'expense'
                          ? 'bg-red-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Expense
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, type: 'income', categoryId: '' }))
                      }
                      className={`p-3 rounded-lg font-medium transition-all ${
                        formData. type === 'income'
                          ? 'bg-green-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Income
                    </button>
                  </div>
                </div>

                {/* Amount */}
                <Input
                  label="Amount"
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  error={formErrors.amount}
                  icon={<FiDollarSign className="text-gray-400" />}
                  required
                />

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleChange}
                    className={`input ${formErrors.categoryId ? 'input-error' : ''}`}
                    required
                  >
                    <option value="">Select a category</option>
                    {filteredCategories.map((cat) => (
                      <option key={cat.id} value={cat. id}>
                        {cat. icon} {cat.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.categoryId && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.categoryId}
                    </p>
                  )}
                </div>

                {/* Description */}
                <Input
                  label="Description"
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Optional description..."
                />

                {/* Date */}
                <Input
                  label="Date"
                  type="date"
                  name="date"
                  value={formData. date}
                  onChange={handleChange}
                  error={formErrors.date}
                  icon={<FiCalendar className="text-gray-400" />}
                  required
                />

                {/* Recurring */}
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isRecurring"
                      name="isRecurring"
                      checked={formData.isRecurring}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="isRecurring" className="ml-2 text-sm text-gray-700">
                      Recurring transaction
                    </label>
                  </div>

                  {formData.isRecurring && (
                    <div className="ml-6 flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="recurrenceType"
                          value="monthly_day"
                          checked={formData.recurrenceType === 'monthly_day'}
                          onChange={handleChange}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm text-gray-700">Monthly (same day)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="recurrenceType"
                          value="every_30_days"
                          checked={formData.recurrenceType === 'every_30_days'}
                          onChange={handleChange}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm text-gray-700">Every 30 days</span>
                      </label>
                    </div>
                  )}
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleCloseModal}
                    fullWidth
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" fullWidth>
                    {editingTransaction ? 'Update' : 'Add'} Transaction
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction? This action cannot be undone."
        confirmText="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDialog({ isOpen: false, id: null })}
      />
    </div>
  );
};

export default Transactions;