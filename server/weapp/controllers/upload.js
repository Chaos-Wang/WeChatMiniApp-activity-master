const { uploader } = require('../qcloud')
const multer = require('koa-multer');//加载koa-multer模块  

var storage = multer.diskStorage({    //文件保存路径    
  destination: function (req, file, cb) 
  {
    cb(null, '../public/upload/')   
  },    //修改文件名称    
  filename: function (req, file, cb)
  {
    var fileFormat = (file.originalname).split(".");
    cb(null,Date.now() + "." + fileFormat[fileFormat.length - 1]);    
  }  })  //加载配置  
	var upload = multer({ storage: storage });  

module.exports = async ctx => {
    // 获取上传之后的结果
    // 具体可以查看：
    const data = await  upload.single('file')
	console.log(ctx.req)
    ctx.state.data = data
}
