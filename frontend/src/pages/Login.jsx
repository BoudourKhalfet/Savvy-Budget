import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/shared/Button';
import Input from '../components/shared/Input';
import { FiMail, FiLock } from 'react-icons/fi';

const Login = () => {
  const navigate = useNavigate();
  const { login, error } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
    
    if (! formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData. email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
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
      await login(formData);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
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
            Welcome back
          </h2>
          <p className="mt-2 text-gray-600">
            Sign in to your account to continue
          </p>
        </div>

        {/* Login Form */}
        <div className="card p-5 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

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
              value={formData. password}
              onChange={handleChange}
              placeholder="••••••••"
              error={formErrors.password}
              icon={<FiLock className="text-gray-400" />}
              required
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>

            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
            >
              Sign in
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-600 hover:text-blue-700 font-semibold">
                Sign up now
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500">
          By signing in, you agree to our{' '}
          <a href="#" className="text-blue-600 hover:text-blue-700">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-blue-600 hover:text-blue-700">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;