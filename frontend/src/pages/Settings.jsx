import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { formatDate } from '../utils/formatters';
import {
  FiUser,
  FiLock,
  FiDollarSign,
  FiBell,
  FiTrash2,
  FiSave,
  FiMail,
  FiCalendar,
} from 'react-icons/fi';
import Card from '../components/shared/Card';
import Button from '../components/shared/Button';
import Input from '../components/shared/Input';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import ConfirmDialog from '../components/shared/ConfirmDialog';

const CURRENCIES = [
  { group: 'Americas', options: [
    { value: 'USD', label: 'USD — US Dollar ($)' },
    { value: 'CAD', label: 'CAD — Canadian Dollar ($)' },
    { value: 'MXN', label: 'MXN — Mexican Peso ($)' },
    { value: 'BRL', label: 'BRL — Brazilian Real (R$)' },
  ]},
  { group: 'Europe', options: [
    { value: 'EUR', label: 'EUR — Euro (€)' },
    { value: 'GBP', label: 'GBP — British Pound (£)' },
    { value: 'CHF', label: 'CHF — Swiss Franc (Fr)' },
    { value: 'SEK', label: 'SEK — Swedish Krona (kr)' },
    { value: 'NOK', label: 'NOK — Norwegian Krone (kr)' },
    { value: 'DKK', label: 'DKK — Danish Krone (kr)' },
    { value: 'TRY', label: 'TRY — Turkish Lira (₺)' },
  ]},
  { group: 'Middle East & Africa', options: [
    { value: 'TND', label: 'TND — Tunisian Dinar (د.ت)' },
    { value: 'MAD', label: 'MAD — Moroccan Dirham (د.م.)' },
    { value: 'DZD', label: 'DZD — Algerian Dinar (د.ج)' },
    { value: 'EGP', label: 'EGP — Egyptian Pound (£)' },
    { value: 'SAR', label: 'SAR — Saudi Riyal (﷼)' },
    { value: 'AED', label: 'AED — UAE Dirham (د.إ)' },
    { value: 'KWD', label: 'KWD — Kuwaiti Dinar (د.ك)' },
    { value: 'QAR', label: 'QAR — Qatari Riyal (﷼)' },
    { value: 'ZAR', label: 'ZAR — South African Rand (R)' },
    { value: 'NGN', label: 'NGN — Nigerian Naira (₦)' },
  ]},
  { group: 'Asia & Pacific', options: [
    { value: 'JPY', label: 'JPY — Japanese Yen (¥)' },
    { value: 'CNY', label: 'CNY — Chinese Yuan (¥)' },
    { value: 'INR', label: 'INR — Indian Rupee (₹)' },
    { value: 'KRW', label: 'KRW — South Korean Won (₩)' },
    { value: 'SGD', label: 'SGD — Singapore Dollar (S$)' },
    { value: 'HKD', label: 'HKD — Hong Kong Dollar (HK$)' },
    { value: 'AUD', label: 'AUD — Australian Dollar ($)' },
    { value: 'PKR', label: 'PKR — Pakistani Rupee (₨)' },
  ]},
];

const ALL_CURRENCY_OPTIONS = CURRENCIES.flatMap(g => g.options);

const Settings = () => {
  const { user, updateUser, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const currencyRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (currencyRef.current && !currencyRef.current.contains(e.target)) {
        setCurrencyOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Profile Form
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    email: '',
    username: '',
    currency: 'USD',
  });

  // Password Form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Preferences Form — seeded from user.preferences once loaded
  const [preferencesForm, setPreferencesForm] = useState({
    emailNotifications: true,
    budgetAlerts: true,
    goalReminders: true,
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (user) {
      setProfileForm({
        fullName: user.fullName || '',
        email: user.email || '',
        username: user.username || '',
        currency: user.currency || 'USD',
      });
      if (user.preferences) {
        setPreferencesForm({
          emailNotifications: user.preferences.emailNotifications ?? true,
          budgetAlerts: user.preferences.budgetAlerts ?? true,
          goalReminders: user.preferences.goalReminders ?? true,
        });
      }
    }
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage('');

    try {
      setLoading(true);
      const response = await authService.updateProfile(profileForm);
      
      if (response. success) {
        updateUser(response.data);
        setSuccessMessage('Profile updated successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      setErrors({
        submit: error.response?.data?.message || 'Failed to update profile',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage('');

    // Validation
    if (passwordForm. newPassword !== passwordForm.confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setErrors({ newPassword: 'Password must be at least 8 characters' });
      return;
    } else if (!/[A-Z]/.test(passwordForm.newPassword)) {
      setErrors({ newPassword: 'Password must contain at least one uppercase letter' });
      return;
    } else if (!/[0-9]/.test(passwordForm.newPassword)) {
      setErrors({ newPassword: 'Password must contain at least one number' });
      return;
    }

    try {
      setLoading(true);
      const response = await authService.changePassword({
        currentPassword: passwordForm. currentPassword,
        newPassword:  passwordForm.newPassword,
      });

      if (response.success) {
        setSuccessMessage('Password changed successfully!');
        setPasswordForm({
          currentPassword:  '',
          newPassword: '',
          confirmPassword: '',
        });
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Failed to change password:', error);
      setErrors({
        submit:  error.response?.data?.message || 'Failed to change password',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePreferencesSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage('');

    try {
      setLoading(true);
      const response = await authService.updatePreferences(preferencesForm);
      if (response.success) {
        updateUser({ ...user, preferences: response.data.preferences });
        setSuccessMessage('Preferences updated successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      setErrors({
        submit: error.response?.data?.message || 'Failed to update preferences',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDeleteAccount = async () => {
    setShowDeleteConfirm(false);
    try {
      setLoading(true);
      await authService.deleteAccount();
      logout();
    } catch (error) {
      console.error('Failed to delete account:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon:  FiUser },
    { id: 'security', label: 'Security', icon: FiLock },
    { id: 'preferences', label: 'Preferences', icon: FiBell },
    { id: 'danger', label: 'Danger Zone', icon: FiTrash2 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {errors. submit && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {errors.submit}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover: text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'profile' && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Profile Information
          </h2>

          {/* User Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {user?.fullName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">{user?.fullName || 'User'}</p>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <FiMail className="w-4 h-4" />
                  {user?. email}
                </p>
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                  <FiCalendar className="w-4 h-4" />
                  Joined {user?.createdAt ? formatDate(user.createdAt) : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              name="fullName"
              value={profileForm.fullName}
              onChange={handleProfileChange}
              placeholder="Enter your full name"
              icon={<FiUser className="text-gray-400" />}
              error={errors.fullName}
            />

            <Input
              label="Username"
              type="text"
              name="username"
              value={profileForm.username}
              onChange={handleProfileChange}
              placeholder="Enter your username"
              icon={<FiUser className="text-gray-400" />}
              error={errors.username}
            />

            <Input
              label="Email"
              type="email"
              name="email"
              value={profileForm.email}
              onChange={handleProfileChange}
              placeholder="Enter your email"
              icon={<FiMail className="text-gray-400" />}
              error={errors.email}
            />

            <div className="relative" ref={currencyRef}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <button
                type="button"
                onClick={() => setCurrencyOpen(o => !o)}
                className="input w-full flex items-center justify-between text-left"
              >
                <span>{ALL_CURRENCY_OPTIONS.find(o => o.value === profileForm.currency)?.label || 'Select currency'}</span>
                <svg className={`w-4 h-4 text-gray-400 transition-transform ${currencyOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {currencyOpen && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                  {CURRENCIES.map(group => (
                    <div key={group.group}>
                      <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 bg-gray-50 sticky top-0">
                        {group.group}
                      </div>
                      {group.options.map(opt => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            handleProfileChange({ target: { name: 'currency', value: opt.value } });
                            setCurrencyOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 hover:text-blue-700 transition-colors ${profileForm.currency === opt.value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'}`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="flex items-center gap-2"
            >
              <FiSave className="w-4 h-4" />
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </Card>
      )}

      {activeTab === 'security' && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Change Password
          </h2>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              name="currentPassword"
              value={passwordForm.currentPassword}
              onChange={handlePasswordChange}
              placeholder="Enter current password"
              icon={<FiLock className="text-gray-400" />}
              error={errors.currentPassword}
              required
            />

            <Input
              label="New Password"
              type="password"
              name="newPassword"
              value={passwordForm.newPassword}
              onChange={handlePasswordChange}
              placeholder="Enter new password"
              icon={<FiLock className="text-gray-400" />}
              error={errors.newPassword}
              required
            />

            <Input
              label="Confirm New Password"
              type="password"
              name="confirmPassword"
              value={passwordForm.confirmPassword}
              onChange={handlePasswordChange}
              placeholder="Confirm new password"
              icon={<FiLock className="text-gray-400" />}
              error={errors.confirmPassword}
              required
            />

            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="flex items-center gap-2"
            >
              <FiSave className="w-4 h-4" />
              {loading ? 'Changing...' : 'Change Password'}
            </Button>
          </form>
        </Card>
      )}

      {activeTab === 'preferences' && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Notification Preferences
          </h2>

          <form onSubmit={handlePreferencesSubmit} className="space-y-6">
            <div className="space-y-4">
              {/* Email Notifications */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Email Notifications</p>
                  <p className="text-sm text-gray-600">
                    Receive email updates about your account
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPreferencesForm(prev => ({ 
                    ...prev, 
                    emailNotifications: !prev.emailNotifications 
                  }))}
                  className={`relative inline-flex items-center h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ml-4 ${
                    preferencesForm.emailNotifications ?  'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white border border-gray-300 shadow transition-transform duration-200 ease-in-out ${
                      preferencesForm.emailNotifications ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              {/* Budget Alerts */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Budget Alerts</p>
                  <p className="text-sm text-gray-600">
                    Get notified when approaching budget limits
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPreferencesForm(prev => ({ 
                    ...prev, 
                    budgetAlerts: ! prev.budgetAlerts 
                  }))}
                  className={`relative inline-flex items-center h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ml-4 ${
                    preferencesForm.budgetAlerts ? 'bg-blue-600' :  'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white border border-gray-300 shadow transition-transform duration-200 ease-in-out ${
                      preferencesForm.budgetAlerts ?  'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              {/* Goal Reminders */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Goal Reminders</p>
                  <p className="text-sm text-gray-600">
                    Receive reminders about your savings goals
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPreferencesForm(prev => ({ 
                    ...prev, 
                    goalReminders: !prev. goalReminders 
                  }))}
                  className={`relative inline-flex items-center h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ml-4 ${
                    preferencesForm.goalReminders ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white border border-gray-300 shadow transition-transform duration-200 ease-in-out ${
                      preferencesForm.goalReminders ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="flex items-center gap-2"
            >
              <FiSave className="w-4 h-4" />
              {loading ?  'Saving...' : 'Save Preferences'}
            </Button>
          </form>
        </Card>
      )}

      {activeTab === 'danger' && (
        <Card className="p-6 border-2 border-red-200">
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            Danger Zone
          </h2>
          <p className="text-gray-600 mb-6">
            Once you delete your account, there is no going back. Please be certain. 
          </p>

          <Button
            variant="danger"
            onClick={handleDeleteAccount}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <FiTrash2 className="w-4 h-4" />
            Delete Account
          </Button>
        </Card>
      )}

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Account"
        message="Are you absolutely sure? This action cannot be undone. All your data will be permanently deleted."
        confirmText="Delete Account"
        confirmVariant="danger"
        onConfirm={confirmDeleteAccount}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
};

export default Settings;