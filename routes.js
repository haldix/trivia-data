const express = require('express');
const Trivia = require('./models/trivia');
const writeToFS = require('./backup');
const router = express.Router();

// Wake heroku server
router.get('/wake', async (req, res) => {
  const test = await Trivia.find({
    question: 'What is the first book of the Bible?',
  });
  if (test.length === 0) return res.json({ connected: false });
  res.json({ connected: true });
});

// Get all questions
router.get('/', async (req, res) => {
  try {
    const questions = await Trivia.find();
    res.status(200).json(questions);
  } catch (err) {
    console.error(err);
  }
});

// Get questions by difficutly
router.get('/level', async (req, res) => {
  try {
    let obj = req.query.difficulty === 'all' ? {} : req.query;
    const questions = await Trivia.find(obj);

    res.status(200).json(questions);
  } catch (err) {
    console.error(err);
  }
});

// Create new question and save
router.post('/', async (req, res) => {
  try {
    const question = req.body;
    await Trivia.create(question);
    res.status(201).json({ msg: 'data saved' });
  } catch (err) {
    console.error(err);
  }
});

// Save mongoDB data to filesystem
router.get('/backup', async (req, res) => {
  const questions = await Trivia.find();
  writeToFS('saved.txt', questions);
});

module.exports = router;
