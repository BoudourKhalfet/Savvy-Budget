const { Transaction } = require('../models');

const getNextDate = (lastDate, originalDay, recurrenceType) => {
  const last = new Date(lastDate);

  if (recurrenceType === 'every_30_days') {
    const next = new Date(last);
    next.setDate(next.getDate() + 30);
    return next;
  }

  // monthly_day: same day next month, clamped to last day of that month
  const nextMonth = last.getMonth() + 1;
  const nextYear = last.getFullYear() + Math.floor(nextMonth / 12);
  const normalizedMonth = nextMonth % 12;
  const lastDayOfNextMonth = new Date(nextYear, normalizedMonth + 1, 0).getDate();
  const targetDay = Math.min(originalDay, lastDayOfNextMonth);
  return new Date(nextYear, normalizedMonth, targetDay);
};

const toDateString = (date) => date.toISOString().split('T')[0];

const processRecurringTransactions = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const recurringTransactions = await Transaction.findAll({
    where: { isRecurring: true }
  });

  let processed = 0;

  for (const t of recurringTransactions) {
    if (!t.lastProcessedDate || !t.recurrenceType) continue;

    const originalDay = new Date(t.date).getDate();
    let lastDate = new Date(t.lastProcessedDate);
    lastDate.setHours(0, 0, 0, 0);

    let nextDate = getNextDate(lastDate, originalDay, t.recurrenceType);
    nextDate.setHours(0, 0, 0, 0);

    // Process all missed dates up to and including today (handles server downtime)
    while (nextDate <= today) {
      await Transaction.create({
        userId: t.userId,
        type: t.type,
        amount: t.amount,
        categoryId: t.categoryId,
        description: t.description,
        date: toDateString(nextDate),
        isRecurring: false,
        recurrenceType: null,
        lastProcessedDate: null
      });

      lastDate = nextDate;
      nextDate = getNextDate(lastDate, originalDay, t.recurrenceType);
      nextDate.setHours(0, 0, 0, 0);
      processed++;
    }

    // Update the template's last_processed_date
    if (lastDate > new Date(t.lastProcessedDate)) {
      await t.update({ lastProcessedDate: toDateString(lastDate) });
    }
  }

};

module.exports = { processRecurringTransactions };
