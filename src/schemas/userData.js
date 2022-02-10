const mongoose = require('mongoose')


const userData = mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  totalXp: {
    type: Number,
    required: true,
  },
  levelXp: {
    type: Number,
    required: true,
  },
  level: {
    type: Number,
    required: true,
  },
})

module.exports = mongoose.model('UserData', userData)