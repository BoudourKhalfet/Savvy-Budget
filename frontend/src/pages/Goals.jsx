import { useState, useEffect } from 'react';
import { goalService } from '../services/goalService';
import { useCurrency } from '../hooks/useCurrency';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiX,
  FiTarget,
  FiTrendingUp,
  FiDollarSign,
  FiCheckCircle,
  FiCalendar,
} from 'react-icons/fi';
import Card from '../components/shared/Card';
import Button from '../components/shared/Button';
import Input from '../components/shared/Input';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import ConfirmDialog from '../components/shared/ConfirmDialog';

const Goals = () => {
  const { formatCurrency } = useCurrency();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showContributionModal, setShowContributionModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, id: null });

  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    targetDate:  '',
    description: '',
  });

  const [contributionData, setContributionData] = useState({
    amount:  '',
    date: new Date().toISOString().split('T')[0],
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const response = await goalService.getGoals();
      setGoals(response.data);
    } catch (error) {
      console.error('Failed to fetch goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (goal = null) => {
    if (goal) {
      setEditingGoal(goal);
      setFormData({
        name: goal.name,
        targetAmount: goal.targetAmount,
        currentAmount: goal.currentAmount || 0,
        targetDate: goal.targetDate
          ? new Date(goal.targetDate).toISOString().split('T')[0]
          : '',
        description: goal.description || '',
      });
    } else {
      setEditingGoal(null);
      setFormData({
        name:  '',
        targetAmount: '',
        currentAmount: '0',
        targetDate: '',
        description: '',
      });
    }
    setFormErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingGoal(null);
    setFormErrors({});
  };

  const handleOpenContributionModal = (goal) => {
    setSelectedGoal(goal);
    setContributionData({
      amount: '',
      date: new Date().toISOString().split('T')[0],
    });
    setShowContributionModal(true);
  };

  const handleCloseContributionModal = () => {
    setShowContributionModal(false);
    setSelectedGoal(null);
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

  const handleContributionChange = (e) => {
    const { name, value } = e.target;
    setContributionData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validate = () => {
    const errors = {};

    if (!formData.name || formData.name.trim() === '') {
      errors.name = 'Goal name is required';
    }

    if (!formData.targetAmount || parseFloat(formData.targetAmount) <= 0) {
      errors.targetAmount = 'Target amount must be greater than 0';
    }

    if (
      formData.currentAmount &&
      parseFloat(formData.currentAmount) < 0
    ) {
      errors.currentAmount = 'Current amount cannot be negative';
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
        targetAmount:  parseFloat(formData.targetAmount),
        currentAmount: parseFloat(formData.currentAmount || 0),
        targetDate:  formData.targetDate || null,
      };

      if (editingGoal) {
        await goalService.updateGoal(editingGoal.id, dataToSubmit);
      } else {
        await goalService.createGoal(dataToSubmit);
      }

      handleCloseModal();
      fetchGoals();
    } catch (error) {
      console.error('Failed to save goal:', error);
      setFormErrors({
        submit: error.response?.data?.message || 'Failed to save goal',
      });
    }
  };

  const handleContributionSubmit = async (e) => {
    e.preventDefault();

    if (!contributionData.amount || parseFloat(contributionData.amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      await goalService.addContribution(selectedGoal.id, {
        amount: parseFloat(contributionData.amount),
        date: contributionData.date,
      });

      handleCloseContributionModal();
      fetchGoals();
    } catch (error) {
      console.error('Failed to add contribution:', error);
      alert('Failed to add contribution');
    }
  };

  const handleDelete = (id) => {
    setConfirmDialog({ isOpen: true, id });
  };

  const confirmDelete = async () => {
    const id = confirmDialog.id;
    setConfirmDialog({ isOpen: false, id: null });

    try {
      await goalService.deleteGoal(id);
      fetchGoals();
    } catch (error) {
      console.error('Failed to delete goal:', error);
      alert('Failed to delete goal');
    }
  };

  const handleMarkComplete = async (id) => {
    try {
      await goalService.markComplete(id);
      fetchGoals();
    } catch (error) {
      console.error('Failed to mark goal as complete:', error);
      alert('Failed to mark goal as complete');
    }
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return 'bg-green-600';
    if (percentage >= 75) return 'bg-blue-600';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  const calculateDaysRemaining = (targetDate) => {
    if (!targetDate) return null;
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const totalGoals = goals.length;
  const completedGoals = goals.filter((g) => g.isCompleted).length;
  const activeGoals = totalGoals - completedGoals;
  const totalTarget = goals.reduce(
    (sum, g) => sum + parseFloat(g.targetAmount),
    0
  );
  const totalSaved = goals.reduce(
    (sum, g) => sum + parseFloat(g.currentAmount || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Savings Goals</h1>
          <p className="text-gray-600 mt-1">
            Track your savings goals and progress
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2"
        >
          <FiPlus className="w-5 h-5" />
          Create Goal
        </Button>
      </div>

      {/* Summary Cards */}
      {goals.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Total Goals</p>
              <FiTarget className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalGoals}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Active Goals</p>
              <FiTrendingUp className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{activeGoals}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Total Target</p>
              <FiDollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(totalTarget)}
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Total Saved</p>
              <FiCheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(totalSaved)}
            </p>
          </Card>
        </div>
      )}

      {/* Goals List */}
      {goals.length > 0 ?  (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {goals.map((goal) => {
            const current = parseFloat(goal.currentAmount || 0);
            const target = parseFloat(goal.targetAmount);
            const percentage = (current / target) * 100;
            const remaining = target - current;
            const daysRemaining = calculateDaysRemaining(goal.targetDate);

            return (
              <Card
                key={goal.id}
                className={`p-6 ${
                  goal.isCompleted ? 'bg-green-50 border-2 border-green-200' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        goal.isCompleted
                          ? 'bg-green-100'
                          : 'bg-blue-100'
                      }`}
                    >
                      {goal.isCompleted ? (
                        <FiCheckCircle className="w-6 h-6 text-green-600" />
                      ) : (
                        <FiTarget className="w-6 h-6 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {goal.name}
                      </h3>
                      {goal.description && (
                        <p className="text-sm text-gray-500 mt-1">
                          {goal.description}
                        </p>
                      )}
                      {goal.isCompleted && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded mt-1">
                          <FiCheckCircle className="w-3 h-3" />
                          Completed
                        </span>
                      )}
                    </div>
                  </div>

                  {!goal.isCompleted && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenModal(goal)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit goal"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(goal.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete goal"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Amount Details */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Target</p>
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(target)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Saved</p>
                    <p className="font-semibold text-blue-600">
                      {formatCurrency(current)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Remaining</p>
                    <p className="font-semibold text-orange-600">
                      {formatCurrency(Math.max(0, remaining))}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {Math.min(percentage, 100).toFixed(1)}% completed
                    </span>
                    {daysRemaining !== null && ! goal.isCompleted && (
                      <span className="text-sm text-gray-600 flex items-center gap-1">
                        <FiCalendar className="w-4 h-4" />
                        {daysRemaining > 0
                          ? `${daysRemaining} days left`
                          : daysRemaining === 0
                          ? 'Due today'
                          : `${Math.abs(daysRemaining)} days overdue`}
                      </span>
                    )}
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

                {/* Action Buttons */}
                {!goal.isCompleted && (
                  <div className="flex gap-3">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleOpenContributionModal(goal)}
                      className="flex-1 flex items-center justify-center gap-2"
                    >
                      <FiPlus className="w-4 h-4" />
                      Add Contribution
                    </Button>
                    {percentage >= 100 && (
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleMarkComplete(goal.id)}
                        className="flex-1 flex items-center justify-center gap-2"
                      >
                        <FiCheckCircle className="w-4 h-4" />
                        Mark Complete
                      </Button>
                    )}
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
              <FiTarget className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No goals yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first savings goal to start tracking your progress
            </p>
            <Button
              variant="primary"
              onClick={() => handleOpenModal()}
              className="inline-flex items-center gap-2"
            >
              <FiPlus className="w-5 h-5" />
              Create Your First Goal
            </Button>
          </div>
        </Card>
      )}

      {/* Create/Edit Goal Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingGoal ? 'Edit Goal' : 'Create Goal'}
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

                {/* Goal Name */}
                <Input
                  label="Goal Name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Emergency Fund, Vacation, New Car"
                  error={formErrors.name}
                  icon={<FiTarget className="text-gray-400" />}
                  required
                />

                {/* Target Amount */}
                <Input
                  label="Target Amount"
                  type="number"
                  name="targetAmount"
                  value={formData.targetAmount}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  error={formErrors.targetAmount}
                  icon={<FiDollarSign className="text-gray-400" />}
                  required
                />

                {/* Current Amount */}
                <Input
                  label="Current Amount"
                  type="number"
                  name="currentAmount"
                  value={formData.currentAmount}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  error={formErrors.currentAmount}
                  icon={<FiDollarSign className="text-gray-400" />}
                />

                {/* Target Date */}
                <Input
                  label="Target Date (Optional)"
                  type="date"
                  name="targetDate"
                  value={formData.targetDate}
                  onChange={handleChange}
                  icon={<FiCalendar className="text-gray-400" />}
                />

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Add notes about this goal..."
                    rows="3"
                    className="input"
                  />
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
                    {editingGoal ? 'Update' : 'Create'} Goal
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Contribution Modal */}
      {showContributionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Add Contribution
                </h2>
                <button
                  onClick={handleCloseContributionModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Contributing to: </p>
                <p className="font-semibold text-gray-900 text-lg">
                  {selectedGoal?.name}
                </p>
              </div>

              <form onSubmit={handleContributionSubmit} className="space-y-4">
                <Input
                  label="Contribution Amount"
                  type="number"
                  name="amount"
                  value={contributionData.amount}
                  onChange={handleContributionChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0.01"
                  icon={<FiDollarSign className="text-gray-400" />}
                  required
                />

                <Input
                  label="Date"
                  type="date"
                  name="date"
                  value={contributionData.date}
                  onChange={handleContributionChange}
                  icon={<FiCalendar className="text-gray-400" />}
                  required
                />

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleCloseContributionModal}
                    fullWidth
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" fullWidth>
                    Add Contribution
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Delete Goal"
        message="Are you sure you want to delete this goal? This action cannot be undone."
        confirmText="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDialog({ isOpen: false, id: null })}
      />
    </div>
  );
};

export default Goals;