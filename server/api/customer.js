const express = require('express');
const logger = require('../logs.js');
const Workout = require('../models/Workout.js');

const router = express.Router();

router.use((req, res, next) => {
  if (!req.user) {
    console.log('no user');
    console.log(req.user);
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
});

// List of API:
// 1. /buy-book
// 2. /my-books

router.post('/buy-book', async (req, res) => {
  const { id, stripeToken } = req.body;

  try {
    await Book.buy({ id, stripeToken, user: req.user });
    res.json({ done: 1 });
  } catch (err) {
    logger.error(err);
    res.json({ error: err.message || err.toString() });
  }
});

// GetMyBooks route

router.get('/newWorkout', async (req, res) => {
  console.log('HIT /workout');
  try {
    const uid = req.user._id;
    const workout = await Workout.getNextWorkout({ uid });
    res.send({
      status: 200,
      message: 'Got your workout!',
      workout,
    });
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

module.exports = router;
