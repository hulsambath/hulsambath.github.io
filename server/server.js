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

// Railway terminates TLS at a single proxy hop; trust exactly one hop so
// express-rate-limit sees the real client IP but spoofed X-Forwarded-For
// chains from clients are not honored.
app.set("trust proxy", 1);
app.disable("x-powered-by");

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
const limiterDefaults = {
  windowMs: 15 * 60 * 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
};

// Tier 1: everything, including the root endpoint
app.use(rateLimit({ ...limiterDefaults, max: 300 }));

// Tier 2: auth surface
app.use("/auth", rateLimit({ ...limiterDefaults, max: 100 }));

// Tier 3: endpoints that call Google's API
app.use(
  ["/auth/refresh", "/auth/callback"],
  rateLimit({ ...limiterDefaults, max: 20 }),
);

// Body parser
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

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
  console.error("Error:", err);
  res.status(err.status || 500).json({ error: "Internal server error" });
});

// Start server
const server = app.listen(PORT, () => {
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

// Bound slow/idle connections (slowloris mitigation).
// Required ordering: keepAliveTimeout < headersTimeout < requestTimeout.
server.requestTimeout = 30_000;
server.headersTimeout = 20_000;
server.keepAliveTimeout = 10_000;

export default app;
