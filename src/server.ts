import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { connectDatabase, isMongoConnected } from './config/database';
import routes from './routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/', routes);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).render('error', { 
    title: 'Error',
    error: err.message || 'An unexpected error occurred' 
  });
});

// Connect to MongoDB and start server
const startServer = async () => {
  // Try to connect to MongoDB (non-blocking)
  await connectDatabase();
  
  // Start server regardless of MongoDB connection status
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    if (isMongoConnected) {
      console.log('✓ Using MongoDB database');
    } else {
      console.log('⚠ Using JSON file fallback (database.json)');
      console.log('  MongoDB connection failed or not available');
    }
  });
};

startServer();
