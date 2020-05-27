const jsonwebtoken = require('jsonwebtoken')
const User = require('../models/users')
const { secret } = require('../conifg');
const { populate } = require('../models/users');

class UserCtl {
  async find(ctx) {
    const { per_page = 10 } = ctx.query
    const page = Math.max( ctx.query.page * 1, 1) - 1;
    const perPage = Math.max( per_page * 1, 1);
    ctx.body = await User    
    .find({name: new RegExp(ctx.query.q)})
    .limit(perPage).skip(perPage * page)
  }
  async findById(ctx) {
    const { fields = ''} = ctx.query;
    const selectFields = fields.split(';').filter( f => f ).map(f => " +" + f).join('');
    const populateStr = fields.split(';').filter( f => f ).map(f => {
      if (f === 'employments') {
        return 'employments.company employments.job'
      }
      else if (f === 'educations') {
        return 'educations.school educations.major'
      } else {
        return f
      }
    }).join(' '); // 因为 populate方法会 显示隐藏字段， 所以要做处理
    const user =  await User.findById(ctx.params.id).select(selectFields) // 通过查询字符串显示隐藏字段
    .populate(populateStr)
    if (!user) {
      ctx.throw(404, '用户不存在')
    }
    ctx.body = user
  }
  async create(ctx) {
    ctx.verifyParams({
      name: {type: 'string', required: true},
      password: {type: 'string', required: true},
 
    })
    const { name } = ctx.request.body
    const repeatedUser = await User.findOne({ name })
    if (repeatedUser) {
      ctx.throw(409, '用户已经占用')
    }
    const user = await new User(ctx.request.body).save()
    ctx.body = user
  }
  async checkOwner(ctx, next) {
    if (ctx.params.id !== ctx.state.user._id) {
      ctx.throw(403, '你沒有权限')
    }
    await next()
  }

  async update(ctx) {    
    ctx.verifyParams({
      name: {type: 'string', required: false},
      password: {type: 'string', required: false},
      avatar_url: {type: 'string', required: false}, 
      gender: {type: 'string', required: false}, 
      headline: {type: 'string', required: false}, 
      locations: {type: 'array', itemType: 'string', required: false}, 
      business: {type: 'string', required: false}, 
      employments: {type: 'array', itemType: 'object', required: false}, 
      educations: {type: 'array', itemType: 'object', required: false},      
    })    
    const user = await User.findByIdAndUpdate(ctx.params.id, ctx.request.body)
    if (!user) {
      ctx.throw(404, '用户不存在')
    }
    ctx.body = user
  }
  async delete(ctx) {
    const user = await User.findByIdAndRemove(ctx.params.id)
    if (!user) {
      ctx.throw(404, '用户不存在')
    }     
    ctx.status = 204
  }
  async login (ctx) {
    ctx.verifyParams({
      name: {type: 'string', required: true},
      password: {type: 'string', required: true}
    })
    const user = await User.findOne(ctx.request.body)
    if(!user) {
      ctx.throw(401, '用户名或密码不正确')
    }
    const { _id, name} = user
    const token = jsonwebtoken.sign( {_id, name}, secret, { expiresIn: '1d'} )
    ctx.body = { token }
  }

  async listFollowing(ctx) {
    const user = await User.findById(ctx.params.id).select('+following').populate('following')
    if (!user) {
      ctx.throw(404)
    }
    ctx.body = user.following
  }

  async listFollowingTopics(ctx) {
    const user = await User.findById(ctx.params.id).select('+followingTopics').populate('followingTopics');
    if (!user) { ctx.throw(404, '用户不存在'); }
    ctx.body = user.followingTopics;
  }

  async listFollowers(ctx) {
    const users = await User.find( {following: ctx.params.id})
    ctx.body = users
  }


  async checkerUserExist(ctx, next) {
    const user = await User.findById(ctx.params.id)
    if (!user) {
      ctx.throw(404, '用户不存在')
    }
    await next()
  }

  async follow(ctx) {
    const me = await User.findById(ctx.state.user._id).select('+following')
    if ( !me.following.map(id => id.toString()).includes(ctx.params.id)) {
      me.following.push(ctx.params.id)
      me.save() 
    }
    ctx.status = 204
  }
  async unfollow(ctx) {
    const me = await User.findById(ctx.state.user._id).select('+following')
    const index = me.following.map( id => id.toString() ).indexOf(ctx.params.id)

    if (index > -1) {
      me.following.splice(index, 1)
      
      me.save() 
    }
    ctx.status = 204
  }

  async followTopic(ctx) {
    const me = await User.findById(ctx.state.user._id).select('+followingTopics')
    if ( !me.followingTopics.map(id => id.toString()).includes(ctx.params.id)) {
      me.followingTopics.push(ctx.params.id)
      me.save() 
    }
    ctx.status = 204
  }

  async unfollowTopic(ctx) {
    const me = await User.findById(ctx.state.user._id).select('+followingTopics');
    const index = me.followingTopics.map(id => id.toString()).indexOf(ctx.params.id);
    if (index > -1) {
      me.followingTopics.splice(index, 1);
      me.save();
    }
    ctx.status = 204;
  }
}

module.exports = new UserCtl();
