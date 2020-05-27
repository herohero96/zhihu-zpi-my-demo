const jwt = require('koa-jwt')
const Router = require('koa-router')
const router = new Router({prefix: '/users'});
const {find, findById, create, update, delete: del, 
  login, checkOwner, listFollowing, listFollowers, follow, unfollow,
  checkerUserExist, listFollowingTopics, followTopic, unfollowTopic
} = require('../controllers/users')
const { checkTopicExist } = require('../controllers/topics')
const { secret } = require('../conifg')

const auth = jwt({ secret })

// 查看列表
router.get('/', find)
// 新增
router.post('/', create)
// 查询
router.get('/:id', auth, checkOwner, findById)
// 修改
router.patch('/:id', auth, checkOwner, update)
// 删除
router.delete('/:id', auth, del)

// 登陆
router.post('/login', login)

// 获取所有关注列表
router.get('/:id/following', listFollowing)
// 获取某人的粉丝列表
router.get('/:id/followers', listFollowers)
// 关注某人
router.put('/following/:id', auth, checkerUserExist,  follow)
// 取消关注
router.delete('/following/:id', auth, checkerUserExist, unfollow)


// 获取所有关注列表
router.get('/:id/followingTopics', listFollowingTopics)
// 关注话题
router.put('/followingTopics/:id', auth, checkTopicExist, followTopic)
// 取消关注话题
router.delete('/followingTopics/:id', auth, checkTopicExist, unfollowTopic)


module.exports = router