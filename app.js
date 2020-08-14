const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const path = require('path');
const triviaRouter = require('./routes.js');

const app = express();

// Dev Tools
if (process.env.NODE_ENV !== 'production') {
  const morgan = require('morgan');
  app.use(morgan('dev'));
  require('dotenv').config();
}

mongoose
  .connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB Connected'))
  .catch(() => console.warn('Error Connecting to MongoDB'));

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.use('/trivia', triviaRouter);

app.listen(3000, () => console.log('Server on Port 3000'));
