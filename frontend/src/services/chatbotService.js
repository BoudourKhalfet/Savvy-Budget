import api from './api';
import { dashboardService } from './dashboardService';
import { budgetService } from './budgetService';
import { goalService } from './goalService';

export const chatbotService = {
  getFinancialContext: async () => {
    try {
      const [summary, budgets, goals] = await Promise.all([
        dashboardService.getSummary('month').catch(() => ({ data: {} })),
        budgetService.getBudgets().catch(() => ({ data: [] })),
        goalService.getGoals().catch(() => ({ data: [] })),
      ]);

      return {
        summary: summary.data,
        budgets: budgets.data,
        goals: goals.data,
      };
    } catch (error) {
      console.error('Failed to get financial context:', error);
      return null;
    }
  },

  sendMessage: async (userMessage) => {
    const response = await api.post('/chatbot/message', { message: userMessage });
    return response.data;
  },

  // eslint-disable-next-line no-unused-vars
  getSuggestedQuestions: (context) => {
    return [
      '💰 How can I save more money this month?',
      '📊 Analyze my spending patterns',
      '🎯 Help me set a realistic budget',
      '💡 Give me tips to reduce expenses',
      '📈 How am I doing financially?',
    ];
  },
};
