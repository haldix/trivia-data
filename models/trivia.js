const mongoose = require('mongoose');

const triviaSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  correct: {
    type: String,
    required: true,
    isCorrect: true,
  },
  wrong1: {
    type: String,
    isCorrect: false,
    required: true,
  },
  wrong2: {
    type: String,
    isCorrect: false,
    required: true,
  },
  wrong3: {
    type: String,
    isCorrect: false,
    required: true,
  },
  difficulty: {
    type: String,
    required: true,
  },
});

const Trivia = mongoose.model('trivia', triviaSchema, 'trivia');

module.exports = Trivia;
