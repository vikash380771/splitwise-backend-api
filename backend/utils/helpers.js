const moment = require('moment');

module.exports = {
  formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(amount);
  },

  getDateRange(filter, startDate, endDate) {
    const now = moment();
    
    switch(filter) {
      case 'current-month':
        return {
          start: now.startOf('month').toDate(),
          end: now.endOf('month').toDate()
        };
      case 'last-month':
        return {
          start: now.subtract(1, 'month').startOf('month').toDate(),
          end: now.subtract(1, 'month').endOf('month').toDate()
        };
      case 'custom':
        return {
          start: new Date(startDate),
          end: new Date(endDate)
        };
      default:
        return null;
    }
  },

  calculateEqualShare(amount, numberOfPeople) {
    return amount / numberOfPeople;
  }
};