import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import authRoutes from './routes/auth.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:5173',
  'https://hulsambath.github.io'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/auth', limiter);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/auth', authRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'NoteMyMinds OAuth Server',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      initiateAuth: '/auth/google',
      callback: '/auth/callback',
      refresh: '/auth/refresh (POST)',
      status: '/auth/status'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
app.listen(PORT, () => {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║          NoteMyMinds OAuth Server                         ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔐 OAuth Client ID: ${process.env.GOOGLE_CLIENT_ID?.substring(0, 20)}...`);
  console.log('');
  console.log('📍 Endpoints:');
  console.log(`   - Root:         http://localhost:${PORT}/`);
  console.log(`   - Auth:         http://localhost:${PORT}/auth/google`);
  console.log(`   - Callback:     http://localhost:${PORT}/auth/callback`);
  console.log(`   - Refresh:      http://localhost:${PORT}/auth/refresh`);
  console.log(`   - Status:       http://localhost:${PORT}/auth/status`);
  console.log('');
  console.log('🌐 Network access:');
  console.log(`   - Local IP:     http://192.168.1.220:${PORT}/`);
  console.log(`   - Mobile app:   http://192.168.1.220:${PORT}/auth/google`);
  console.log('');
  console.log('✅ Server ready to accept requests');
  console.log('');
});

export default app;
