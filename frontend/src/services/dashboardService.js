import api from './api';

export const dashboardService = {
  // Get dashboard summary
  getSummary: async (period = 'month') => {
    const response = await api.get('/dashboard/summary', {
      params: { period },
    });
    return response.data;
  },

  // Get chart data
  getChartData:  async (period = 'month') => {
    const response = await api.get('/dashboard/charts', {
      params: { period },
    });
    return response.data;
  },
};