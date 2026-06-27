import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/shared/Button';
import Input from '../components/shared/Input';
import { FiMail, FiLock, FiUser } from 'react-icons/fi';

const Register = () => {
  const navigate = useNavigate();
  const { register, error } = useAuth();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:  value,
    }));
    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validate = () => {
    const errors = {};
    
    if (!formData.fullName) {
      errors.fullName = 'Full name is required';
    }
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData. email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(formData.password)) {
      errors.password = 'Password must contain at least one uppercase letter';
    } else if (!/[0-9]/.test(formData.password)) {
      errors.password = 'Password must contain at least one number';
    }
    
    if (!formData. confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData. confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    if (!agreedToTerms) {
      errors.terms = 'You must agree to the Terms of Service to continue';
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

    setLoading(true);
    try {
      await register({
        fullName: formData. fullName,
        email: formData.email,
        password: formData.password,
      });
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8 overflow-x-hidden">
      <div className="max-w-md w-full space-y-8">
        {/* Logo/Header */}
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold gradient-text mb-2 pb-2">
            Savvy Budget
          </h1>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-gray-600">
            Start managing your finances smarter
          </p>
        </div>

        {/* Register Form */}
        <div className="card p-5 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <Input
              label="Full Name"
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="John Doe"
              error={formErrors.fullName}
              icon={<FiUser className="text-gray-400" />}
              required
            />

            <Input
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              error={formErrors.email}
              icon={<FiMail className="text-gray-400" />}
              required
            />

            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              error={formErrors.password}
              icon={<FiLock className="text-gray-400" />}
              required
            />

            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              error={formErrors.confirmPassword}
              icon={<FiLock className="text-gray-400" />}
              required
            />

            <div>
              <div className="flex items-start">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => {
                    setAgreedToTerms(e.target.checked);
                    if (formErrors.terms) setFormErrors((p) => ({ ...p, terms: '' }));
                  }}
                  className="h-4 w-4 mt-0.5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="terms" className="ml-3 text-sm text-gray-700">
                  I agree to the{' '}
                  <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">Terms of Service</a>{' '}
                  and{' '}
                  <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">Privacy Policy</a>
                </label>
              </div>
              {formErrors.terms && (
                <p className="mt-1 text-sm text-red-600">{formErrors.terms}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
            >
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account? {' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;