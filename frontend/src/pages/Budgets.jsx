import { useState, useEffect } from 'react';
import { budgetService } from '../services/budgetService';
import { categoryService } from '../services/categoryService';
import { useCurrency } from '../hooks/useCurrency';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiX,
  FiAlertTriangle,
  FiCheckCircle,
  FiPieChart,
  FiTrendingUp,
} from 'react-icons/fi';
import Card from '../components/shared/Card';
import Button from '../components/shared/Button';
import Input from '../components/shared/Input';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import ConfirmDialog from '../components/shared/ConfirmDialog';

const Budgets = () => {
  const { formatCurrency } = useCurrency();
  const [budgets, setBudgets] = useState([]);
  const [budgetStatus, setBudgetStatus] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);

  const [formData, setFormData] = useState({
    categoryId: '',
    amount: '',
    period: 'monthly',
  });

  const [formErrors, setFormErrors] = useState({});
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, id: null });

  useEffect(() => {
    fetchBudgets();
    fetchBudgetStatus();
    fetchCategories();
  }, []);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const response = await budgetService.getBudgets();
      setBudgets(response.data);
    } catch (error) {
      console.error('Failed to fetch budgets:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBudgetStatus = async () => {
    try {
      const response = await budgetService.getBudgetStatus();
      setBudgetStatus(response.data);
    } catch (error) {
      console.error('Failed to fetch budget status:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getCategories('expense');
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleOpenModal = (budget = null) => {
    if (budget) {
      setEditingBudget(budget);
      setFormData({
        categoryId: budget.categoryId,
        amount: budget.amount,
        period: budget.period || 'monthly',
      });
    } else {
      setEditingBudget(null);
      setFormData({
        categoryId: '',
        amount: '',
        period: 'monthly',
      });
    }
    setFormErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingBudget(null);
    setFormErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const errors = {};

    if (!formData.categoryId) {
      errors.categoryId = 'Please select a category';
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      errors.amount = 'Amount must be greater than 0';
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

      if (editingBudget) {
        await budgetService.updateBudget(editingBudget.id, dataToSubmit);
      } else {
        await budgetService.createBudget(dataToSubmit);
      }

      handleCloseModal();
      fetchBudgets();
      fetchBudgetStatus();
    } catch (error) {
      console.error('Failed to save budget:', error);
      setFormErrors({
        submit: error.response?.data?.message || 'Failed to save budget',
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
      await budgetService.deleteBudget(id);
      fetchBudgets();
      fetchBudgetStatus();
    } catch (error) {
      console.error('Failed to delete budget:', error);
    }
  };

  const getProgressColor = (percentage) => {
    if (percentage > 100) return 'bg-red-600';
    if (percentage === 100) return 'bg-blue-600';
    if (percentage >= 80) return 'bg-orange-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-green-600';
  };

  const getStatusIcon = (percentage) => {
    if (percentage >= 100) {
      return <FiAlertTriangle className="w-5 h-5 text-red-600" />;
    }
    if (percentage >= 80) {
      return <FiAlertTriangle className="w-5 h-5 text-orange-500" />;
    }
    return <FiCheckCircle className="w-5 h-5 text-green-600" />;
  };

  const getStatusText = (percentage) => {
    if (percentage > 100) return 'Over budget';
    if (percentage === 100) return 'Fully used';
    if (percentage >= 80) return 'Approaching limit';
    return 'On track';
  };

  const totalBudget = budgets.reduce((sum, b) => sum + parseFloat(b.amount), 0);
  const totalSpent = budgetStatus?.budgets?.reduce(
    (sum, b) => sum + parseFloat(b.spent || 0),
    0
  ) || 0;
  const overallPercentage = totalBudget > 0 ?  (totalSpent / totalBudget) * 100 : 0;

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Budgets</h1>
          <p className="text-gray-600 mt-1">
            Set spending limits and track your progress
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2"
        >
          <FiPlus className="w-5 h-5" />
          Create Budget
        </Button>
      </div>

      {/* Overall Summary */}
      {budgets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Total Budget</p>
              <FiPieChart className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(totalBudget)}
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Total Spent</p>
              <FiTrendingUp className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(totalSpent)}
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Remaining</p>
              {getStatusIcon(overallPercentage)}
            </div>
            <p
              className={`text-2xl font-bold ${
                totalBudget - totalSpent >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {formatCurrency(totalBudget - totalSpent)}
            </p>
          </Card>
        </div>
      )}

      {/* Budget List */}
      {budgets.length > 0 ?  (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {budgets.map((budget) => {
            const statusData = budgetStatus?.budgets?.find(
              (b) => b.budgetId === budget.id
            );
            const spent = parseFloat(statusData?.spent || 0);
            const remaining = parseFloat(budget.amount) - spent;
            const percentage = (spent / parseFloat(budget.amount)) * 100;

            return (
              <Card key={budget.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-2xl">
                      {budget.category?.icon || '📁'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {budget.category?.name || 'Category'}
                      </h3>
                      <p className="text-sm text-gray-500 capitalize">
                        {budget.period} budget
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenModal(budget)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit budget"
                    >
                      <FiEdit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(budget.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete budget"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Amount Details */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Budget</p>
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(budget.amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Spent</p>
                    <p className="font-semibold text-orange-600">
                      {formatCurrency(spent)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Remaining</p>
                    <p
                      className={`font-semibold ${
                        remaining >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {formatCurrency(remaining)}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {percentage.toFixed(1)}% used
                    </span>
                    <span
                      className={`text-sm font-medium ${
                        percentage > 100
                          ? 'text-red-600'
                          : percentage === 100
                          ? 'text-blue-600'
                          : percentage >= 80
                          ? 'text-orange-500'
                          : 'text-green-600'
                      }`}
                    >
                      {getStatusText(percentage)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`${getProgressColor(
                        percentage
                      )} h-3 rounded-full transition-all duration-300`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Warning Message */}
                {percentage >= 80 && (
                  <div
                    className={`flex items-center gap-2 p-3 rounded-lg ${
                      percentage > 100
                        ? 'bg-red-50 text-red-700'
                        : percentage === 100
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-orange-50 text-orange-700'
                    }`}
                  >
                    <FiAlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <p className="text-sm font-medium">
                      {percentage > 100
                        ? `You've exceeded this budget by ${formatCurrency(Math.abs(remaining))}`
                        : percentage === 100
                        ? `You've used your entire budget for this category`
                        : `You're approaching your budget limit`}
                    </p>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiPieChart className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No budgets yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first budget to start tracking your spending limits
            </p>
            <Button
              variant="primary"
              onClick={() => handleOpenModal()}
              className="inline-flex items-center gap-2"
            >
              <FiPlus className="w-5 h-5" />
              Create Your First Budget
            </Button>
          </div>
        </Card>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingBudget ? 'Edit Budget' : 'Create Budget'}
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
                    {formErrors.submit}
                  </div>
                )}

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleChange}
                    className={`input ${
                      formErrors.categoryId ?  'input-error' : ''
                    }`}
                    required
                    disabled={editingBudget}
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.categoryId && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.categoryId}
                    </p>
                  )}
                </div>

                {/* Amount */}
                <Input
                  label="Budget Amount"
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  error={formErrors.amount}
                  icon={<FiPieChart className="text-gray-400"/>}
                  required
                />

                {/* Period */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Period *
                  </label>
                  <select
                    name="period"
                    value={formData.period}
                    onChange={handleChange}
                    className="input"
                    required
                  >
                    <option value="monthly">Monthly</option>
                    <option value="weekly">Weekly</option>
                    <option value="yearly">Yearly</option>
                  </select>
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
                    {editingBudget ?  'Update' : 'Create'} Budget
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Delete Budget"
        message="Are you sure you want to delete this budget? This action cannot be undone."
        confirmText="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDialog({ isOpen: false, id: null })}
      />
    </div>
  );
};

export default Budgets;