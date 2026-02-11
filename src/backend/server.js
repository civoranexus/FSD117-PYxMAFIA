// Backend entry point
import 'dotenv/config';
import app from './src/app.js';
import connectDB from './src/db/db.js';

const PORT = process.env.PORT || 3000;

// Connect to Database
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`\n🚀 Server is running on port ${PORT}`);
      console.log(`👉 http://localhost:${PORT}\n`);
    });
  })
  .catch((err) => {
    console.error('❌ Failed to connect to database:', err);
    process.exit(1);
  });

// Global Error Handlers
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});