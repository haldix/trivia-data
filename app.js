const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const path = require('path');
const triviaRouter = require('./routes.js');

const app = express();

// Dev Tools
if (process.env.NODE_ENV !== 'production') {
  const morgan = require('morgan');
  app.use(morgan('dev'));
  require('dotenv').config();
}

// Database
mongoose
  .connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB Connected'))
  .catch(() => console.warn('Error Connecting to MongoDB'));

// Middleware
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Security
app.use(mongoSanitize());
app.use(helmet());
app.use(xss());
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // limit each IP to 500 requests per windowMs
});
app.use(limiter);
app.use(hpp());

//Routes
app.use('/trivia', triviaRouter);

app.all('*', (req, res) => {
  res.status(404).send({
    status: 'fail',
    message: `Cannot find ${req.originalUrl} on this server.`,
  });
});

app.listen(process.env.PORT, () => console.log('Server on Port 3000'));
