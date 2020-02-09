const Koa = require('koa')
const app = new Koa()
const debug = require('debug')('koa-weapp-demo')
const response = require('./middlewares/response')
const bodyParser = require('./middlewares/bodyparser')
const config = require('./config')
const myLog = require('koa-sam-log')
var date = new Date()
const { mysql } = require('./qcloud')
var SqlSign = true
exports.SqlSign=SqlSign
// 使用响应处理中间件
app.use(response)

app.use(async (ctx, next) => {
console.log(`Process ${ctx.request.method} ${ctx.request.url}...`);
var ac = await mysql("cActivity")
    for(var i of ac){
    	i.acInfo=JSON.parse(i.acInfo)
      	var curTime =new Date()
        var acId= i.acId
        var startTime = new Date(Date.parse(i.acInfo.startTime))
        var deadlineTime = new Date(Date.parse(i.acInfo.deadlineTime))
		if(i.statusCode!=3){
        	if(curTime<=deadlineTime)
        		i.statusCode=0
      		else if (curTime<=startTime &&curTime >= deadlineTime)
        		i.statusCode=1
      		else
        		i.statusCode=2
        }else{
        	i.statusCode=3
        }
      	await mysql('cActivity').update({statusCode:i.statusCode}).where({acId})
    }
await next();
});
// 文件上传，注意书写的位置很重要，否则无法上传
// 解析请求体
app.use(bodyParser())

app.use(myLog({ 
    type: "console",   //按日期创建文件，文件名为 filename + pattern
    filename: 'logs/',
    pattern: 'yyyy-MM-dd.log',
    alwaysIncludePattern: true
},{
    env: 'development',      //如果是app.env则可以同时在控制台中打印
    level: 'trace'      //logger level
}))

// 引入路由分发
const router = require('./routes')

app.use(router.routes())


// 启动程序，监听端口
app.listen(config.port, () => debug(`listening on port ${config.port}`))
