const app = require('./backend/app');
const dotenv = require('dotenv');
const { sequelize } = require('./backend/models');

dotenv.config();

const PORT = process.env.PORT || 3000;

// Sync database and start server
sequelize.sync({ alter: true })
  .then(() => {
    console.log('Database synced successfully');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Unable to sync database:', err);
  });