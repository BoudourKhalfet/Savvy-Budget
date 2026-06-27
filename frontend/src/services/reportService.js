import api from './api';

export const reportService = {
  // Get report summary
  getReportSummary: async (params = {}) => {
    const response = await api.get('/reports/summary', { params });
    return response.data;
  },

  // Get trend data for last 7 periods
  getTrend: async (period = 'month') => {
    const response = await api.get('/reports/trend', { params: { period } });
    return response.data;
  },

  // Export report
  exportReport: async (format = 'json', params = {}) => {
    const response = await api.get('/reports/export', {
      params: { format, ... params },
    });
    return response.data;
  },
};