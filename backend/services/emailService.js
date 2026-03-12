const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendMonthlyBalanceReport(userEmail, balances) {
    const htmlContent = this.generateBalanceReportHTML(balances);
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: 'Your Monthly Splitwise Balance Report',
      html: htmlContent
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Monthly report sent to ${userEmail}`);
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  generateBalanceReportHTML(balances) {
    let totalYouAreOwed = 0;
    let totalYouOwe = 0;
    
    const balanceRows = balances.map(b => {
      if (b.amount > 0) totalYouAreOwed += b.amount;
      if (b.amount < 0) totalYouOwe += Math.abs(b.amount);
      
      return `
        <tr>
          <td>${b.email}</td>
          <td>${b.amount > 0 ? 'Owes you' : 'You owe'}</td>
          <td>${Math.abs(b.amount)} ${b.currency}</td>
        </tr>
      `;
    }).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #5cc5c5; color: white; padding: 20px; text-align: center; }
          .summary { background: #f5f5f5; padding: 15px; margin: 20px 0; }
          table { width: 100%; border-collapse: collapse; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background-color: #f2f2f2; }
          .positive { color: green; }
          .negative { color: red; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Monthly Balance Report</h1>
          </div>
          
          <div class="summary">
            <h3>Summary</h3>
            <p>Total you are owed: <span class="positive">${totalYouAreOwed.toFixed(2)}</span></p>
            <p>Total you owe: <span class="negative">${totalYouOwe.toFixed(2)}</span></p>
          </div>

          <h3>Detailed Balances</h3>
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Status</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${balanceRows}
            </tbody>
          </table>
        </div>
      </body>
      </html>
    `;
  }
}

module.exports = new EmailService();