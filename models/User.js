const mongoose = require('mongoose');
const schema = mongoose.Schema;

const userSchema = new schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    timezone: { type: String, required: true, default: 'UTC' },
    refreshToken: { type: String }
});
module.exports = mongoose.model('User', userSchema);