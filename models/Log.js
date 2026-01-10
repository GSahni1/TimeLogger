const mongoose = require('mongoose');
const schema = mongoose.Schema;

const logSchema = new schema({
  user: {
    type: schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  habit: {
    type: schema.Types.ObjectId,
    ref: 'Habit',
    required: true
  },
  note: {
    type: String
  },
}, {timestamps: true
});

const Log = mongoose.model('Log', logSchema);
module.exports = Log;
