const express = require('express');
const Trivia = require('./models/trivia');
const router = express.Router();

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
