import api from './api';

export const goalService = {
  getGoals: async (status) => {
    const params = status ? { status } : {};
    const response = await api.get('/goals', { params });
    return response.data;
  },

  getGoal: async (id) => {
    const response = await api.get(`/goals/${id}`);
    return response.data;
  },

  createGoal: async (goalData) => {
    const response = await api.post('/goals', goalData);
    return response.data;
  },

  updateGoal: async (id, goalData) => {
    const response = await api.put(`/goals/${id}`, goalData);
    return response.data;
  },

  deleteGoal: async (id) => {
    const response = await api.delete(`/goals/${id}`);
    return response.data;
  },

  addContribution: async (id, contributionData) => {
    const response = await api.post(`/goals/${id}/contribute`, contributionData);
    return response.data;
  },

  markComplete: async (id) => {
    const response = await api.put(`/goals/${id}/complete`);
    return response.data;
  },
};
