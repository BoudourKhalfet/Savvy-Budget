const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

class AIService {
  async generateResponse(userMessage, financialContext) {
    try {
      if (!process.env.GROQ_API_KEY) {
        return this.generateMockResponse(userMessage, financialContext);
      }

      const systemMessage = this.buildSystemMessage(financialContext);

      const completion = await openai.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 300
      });

      return {
        success: true,
        message: completion.choices[0].message.content
      };

    } catch (error) {
      return this.generateMockResponse(userMessage, financialContext);
    }
  }

  buildSystemMessage(context) {
    const income = context?.totalIncome || 0;
    const expenses = context?.totalExpenses || 0;
    const net = income - expenses;
    const savingsRate = income > 0 ? ((net / income) * 100).toFixed(1) : 0;

    let message = `You are an AI financial assistant built into "Savvy Budget", a personal finance web app.

ABOUT SAVVY BUDGET - these are the ONLY features available in this app:
- Transactions: users log income and expense transactions with categories, amounts, dates, and descriptions
- Categories: predefined categories like Food & Dining, Transportation, Housing/Rent, Utilities, Shopping, Entertainment, Healthcare, Education, Fitness, Travel, Subscriptions, Salary, Freelance, Investments, etc.
- Budgets: users set spending limits per category per month and track how much they've spent vs their limit
- Goals: users create savings goals with a target amount, current amount saved, and an optional deadline
- Dashboard: shows monthly income, expenses, net balance, recent transactions, and spending by category
- Reports: visual charts showing spending trends over time

STRICT RULES:
- Only suggest actions that exist in Savvy Budget (adding transactions, setting budgets, creating goals)
- NEVER suggest linking external accounts, connecting to banks, or syncing with other apps — this feature does not exist
- NEVER mention features that are not listed above
- If the user has no data yet, guide them to start by adding their first transaction or setting a budget
- Give advice based on their actual financial data shown below
- Be friendly, specific, and concise (2-4 sentences max)
- Always refer to the app as "Savvy Budget"`;

    if (context) {
      message += `\n\nUSER'S CURRENT FINANCIAL DATA (this month):
- Monthly Income: $${income.toFixed(2)}
- Monthly Expenses: $${expenses.toFixed(2)}
- Net Balance: $${net.toFixed(2)} (${savingsRate}% savings rate)
- Active Budgets set up: ${context.budgetCount || 0}
- Savings Goals created: ${context.goalCount || 0}`;

      if (income === 0 && expenses === 0) {
        message += `\n\nNote: This user has no transactions yet. Guide them to start by adding their income and expenses in the Transactions page.`;
      } else if (net < 0) {
        message += `\n\nNote: This user is spending more than they earn. Prioritize advice on reducing expenses.`;
      } else if (context.budgetCount === 0) {
        message += `\n\nNote: This user has no budgets set up yet. Recommend they create budgets in the Budgets page.`;
      } else if (context.goalCount === 0) {
        message += `\n\nNote: This user has no savings goals. Recommend they create a goal in the Goals page.`;
      }
    }

    return message;
  }

  generateMockResponse(message, context) {
    const lower = message.toLowerCase();
    const income = context?.totalIncome || 0;
    const expenses = context?.totalExpenses || 0;
    const net = income - expenses;
    const savingsRate = income > 0 ?  ((net / income) * 100).toFixed(1) : 0;

    // Greeting
    if (lower.match(/^(hi|hello|hey)/)) {
      return {
        success: true,
        message: `Hello! 👋 You have $${income.toFixed(2)} income and $${expenses.toFixed(2)} expenses this month (${savingsRate}% savings rate). How can I help?`
      };
    }

    // Save money
    if (lower.includes('save')) {
      return {
        success: true,
        message: net > 0 
          ? `Great! You're saving $${net.toFixed(2)}/month (${savingsRate}%). Try the 50/30/20 rule to save even more!  💰`
          : `You're spending more than you earn.  Track expenses daily to find cuts. Even $50/month = $600/year!  📊`
      };
    }

    // Spending
    if (lower.includes('spending') || lower.includes('expense')) {
      return {
        success: true,
        message: `With $${expenses.toFixed(2)} in expenses, look for patterns. Do you overspend on weekends? Identify triggers to cut back strategically!  🎯`
      };
    }

    // Budget
    if (lower.includes('budget')) {
      return {
        success: true,
        message:  `You have ${context?.budgetCount || 0} budgets.  Create budgets for your top 3 categories with realistic limits, then beat them! 📈`
      };
    }

    // Tips
    if (lower.includes('tip') || lower.includes('advice')) {
      const tips = [
        `💡 Pay yourself first!  Auto-transfer to savings when you get paid.`,
        `💡 24-hour rule: Wait a day before purchases over $50.`,
        `💡 Review subscriptions monthly. $10/month = $120/year!`,
        `💡 Meal prep Sundays. Save $200+/month eating out less!`,
        `💡 Build a $500 emergency fund first. It covers most surprises!`
      ];
      return {
        success: true,
        message: tips[Math.floor(Math.random() * tips.length)]
      };
    }

    // Financial health
    if (lower.includes('doing') || lower.includes('health')) {
      let status = savingsRate >= 20 ? 'excellent!  🌟' : savingsRate >= 10 ? 'good! 📈' : net > 0 ? 'okay 💪' : 'challenging 🔧';
      return {
        success: true,
        message: `You're doing ${status} Income: $${income. toFixed(2)}, Expenses: $${expenses.toFixed(2)}, Net: $${net.toFixed(2)} (${savingsRate}% savings).`
      };
    }

    // Default
    return {
      success: true,
      message:  `I'm your financial assistant! You have $${income.toFixed(2)} income, $${expenses. toFixed(2)} expenses (net: $${net.toFixed(2)}). Ask about saving, budgeting, or tips! 💡`
    };
  }
}

module.exports = new AIService();