const Koa = require('koa');
const koaBody = require('koa-body')
const error = require('koa-json-error')
const mongoose = require('mongoose')
const routing = require('./routes')
const parameter = require('koa-parameter')
const koaStatic = require('koa-static')
const {connectionStr} = require('./conifg')
const  path = require('path')
const app = new Koa();

mongoose.connect(connectionStr, { useNewUrlParser: true,  useUnifiedTopology: true  }, () =>  console.log('连接成功了'))
mongoose.connection.on('error', console.error)

app.use(koaStatic(path.join(__dirname, 'public')))  // 生成静态资源的路径 例如：http://localhost:3000/uploads/upload_c333a4be399354bcd8aac090934645b9.jpg 
// 开发环境stack报错提示，线上环境禁止stack报错提示
app.use(error({
  postFormat: (e, {stack, ...rest}) => process.env.NODE_ENV === 'production' ? rest : {stack, ...rest}
})) 

app.use(koaBody({
  multipart: true, // 代表支持文件格式了
  formidable: {
    uploadDir: path.join(__dirname, '/public/uploads'), // 上传目录
    keepExtensions: true,  // 保留扩展名
  }
}))  // 解析 body的
app.use(parameter(app)) // 效验参数  注意要把app写进去
routing(app)
app.listen(3000, () => console.log('3000登录 启动程序'))