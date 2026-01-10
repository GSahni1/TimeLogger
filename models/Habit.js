const mongoose = require('mongoose');
const schema = mongoose.Schema;

const habitSchema = new schema({
  user: {
    type: schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  }
});

const Habit = mongoose.model('Habit', habitSchema);
module.exports = Habit;
