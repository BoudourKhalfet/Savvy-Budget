import { useAuth } from '../context/AuthContext';
import { formatCurrency as _formatCurrency } from '../utils/formatters';

export const useCurrency = () => {
  const { user } = useAuth();
  const currency = user?.currency || 'USD';

  const formatCurrency = (amount) => _formatCurrency(amount, currency);

  return { formatCurrency, currency };
};
