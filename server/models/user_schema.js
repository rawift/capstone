const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  githubId: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true,
    unique: true 
  },
  displayName: {
    type: String
  },
  email: {
    type: String 
  },
  accessToken: {
    type: String
  },
  avatarUrl: {
    type: String
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

module.exports = User;
