const mongoose = require('mongoose')
mongoose.set('useFindAndModify', false)

const { Schema, model } =  mongoose

const userSchema = Schema({
  __v: {type: Number, select: false},
  name: {type: String, required: true},
  password: {type: String, required: true, select: false},  // select 的作用， 请求返回数据时不会返回password了
  avatar_url: {type: String},
  gender: {type: String, enum: ['male', 'female'], default: 'male', required: true},
  headline: {type: String},
  locations: {type: [{type: Schema.Types.ObjectId, ref: 'Topic'}],  select: false},
  business: {type: Schema.Types.ObjectId, ref: 'Topic', select: false},
  employments: {
    type: [
      {
        company: {type: Schema.Types.ObjectId, ref: 'Topic'}, // 关联话题
        job: {type: Schema.Types.ObjectId, ref: 'Topic'},
      }
    ],
    select: false
  },
  educations: {
    type: [{
      school: {type: Schema.Types.ObjectId, ref: 'Topic'},
      major: {type: Schema.Types.ObjectId, ref: 'Topic'},
      diplom: {type: Number, enum: [1,2,3,4,5]},
      entrance_year: {type: Number},
      graduation_year: {type: Number},
    }],
    select: false
  },
  following: {
    type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    select: false,
  },
  followingTopics: {
    type: [{ type: Schema.Types.ObjectId, ref: 'Topic' }],
    select: false,
  },

})

module.exports = model('User', userSchema)

