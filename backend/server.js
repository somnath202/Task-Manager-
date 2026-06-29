const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middlewares/errorHandler');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Security Middlewares
app.use(helmet());

// CORS configuration (allow requests from localhost in development and vercel in production)
const allowedOrigins = [
  'http://localhost:5173', // standard Vite port
  'http://127.0.0.1:5173',
  process.env.FRONTEND_URL // Vercel production frontend URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, or server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      return callback(null, true);
    } else {
      return callback(new Error('Blocked by CORS policy'), false);
    }
  },
  credentials: true
}));

// Request Logger
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate Limiter to prevent brute force and DDoS attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', limiter);

// Mount API routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/todos', require('./routes/todoRoutes'));
app.use('/api/activities', require('./routes/activityRoutes'));

// Status check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'Todo API is running smoothly',
    timestamp: new Date()
  });
});

// 404 Route handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'API route not found'
  });
});

// Global Error Handler Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
