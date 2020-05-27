const jwt = require('koa-jwt')
const Router = require('koa-router')
const router = new Router({prefix: '/topics'});
const {find, findById, create, update, checkTopicExist, 
  listFollowers
} = require('../controllers/topics')
const { secret } = require('../conifg')

const auth = jwt({ secret })

// 查看列表
router.get('/', find)
// 新增
router.post('/', create)
// 查询
router.get('/:id', auth, findById)
// 修改
router.patch('/:id', auth, update)

// 某话题有哪些用户关注
router.get('/:id/followers', checkTopicExist, listFollowers);

module.exports = router