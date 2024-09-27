import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';

dotenv.config(); // Load .env variables

// Connect to MongoDB
connectDB();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increase limit here

// Routes
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
