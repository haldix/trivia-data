const express = require('express');
const Trivia = require('./models/trivia');
const router = express.Router();

router.get('/wake', async (req, res) => {
  const test = await Trivia.find({
    question: 'What is the first book of the Bible?',
  });
  if (test.length === 0) return res.json({ connected: false });
  res.json({ connected: true });
});

router.get('/', async (req, res) => {
  try {
    const questions = await Trivia.find();
    res.status(200).json(questions);
  } catch (err) {
    console.log(err);
  }
});

router.post('/', async (req, res) => {
  try {
    const question = req.body;
    await Trivia.create(question);
    res.status(201).json({ msg: 'data saved' });
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
