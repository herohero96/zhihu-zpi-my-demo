const mongoose = require('mongoose')
mongoose.set('useFindAndModify', false)

const { Schema, model } =  mongoose

const topicSchema = Schema({
  __v: {type: Number, select: false},
  name: {
    type: String, required: true
  },
  avatar_url: {type: String},
  introduction: {type: String, select: false},


})

module.exports = model('Topic', topicSchema)

