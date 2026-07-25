require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const path    = require('path');
const connectDB = require('./config/db');
const sanitize = require('./middleware/sanitize');
const { apiLimiter } = require('./middleware/rateLimit');

const app = express();
connectDB();

// Render (and most PaaS hosts) sit behind a reverse proxy — without this,
// express-rate-limit sees every request as coming from the proxy's IP and
// either rate-limits all users as one bucket or can't identify clients at all.
app.set('trust proxy', 1);

// Cross-origin resource policy defaults to same-origin, which would block the
// Vercel-hosted frontend (a different origin) from loading hero/category
// images served from this API's /uploads path.
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((s) => s.trim().replace(/\/$/, ''))
  : ['http://localhost:5173', 'http://localhost:4173'];
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) cb(null, true);
    else cb(new Error('CORS: origin not allowed'));
  },
  credentials: true,
}));
app.use(express.json());
app.use(sanitize);
app.use('/api', apiLimiter);
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

app.use('/api/auth',     require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders',   require('./routes/orderRoutes'));
app.use('/api/payment',  require('./routes/paymentRoutes'));
app.use('/api/admin',      require('./routes/adminRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/settings',    require('./routes/settingRoutes'));
app.use('/api/hero-slides',  require('./routes/heroSlideRoutes'));
app.use('/api/subscribers', require('./routes/subscriberRoutes'));
app.use('/api/promo',       require('./routes/promoRoutes'));
app.use('/api/saloons',     require('./routes/saloonRoutes'));
app.use('/api/contact',     require('./routes/contactRoutes'));

app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({ message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
