const multer = require('koa-multer')//加载koa-multer模块  
const { mysql } = require('../qcloud')
var app = require('../app.js')
var storage = multer.diskStorage({    //文件保存路径    
  destination: function (req, file, cb) 
  {
    cb(null, '../image')   
  },    //修改文件名称    
  filename: function (req, file, cb)
  {
    var fileFormat = (file.originalname).split(".");
    cb(null,Date.now() + "." + fileFormat[fileFormat.length - 1]);    
  }  })  //加载配置  
var upload = multer({ storage: storage }); 
//修改完成
exports.AsyncUploadAcImg=async (ctx, next) => {
	var img_url='https://www.wxxcx.chaoswang.cn'+ctx.req.file.path.substr(1).substr(1)
    var acId=ctx.req.body.ac_id
    var openid=ctx.req.body.open_id
	
	var imgId= await mysql("cImages").insert({ imgCreatorId:openid,
                                               acImgUrl:img_url
    											})
	while(true){
      console.log('start'+app.SqlSign)
      if(app.SqlSign){
    	var res=await mysql("cActivity").where({acId}).first();
    	if(res.acImgList=='#'){
      		console.log('1')
      		res.acImgList='#'+imgId
    	}else{
      		console.log('2')
  	  		res.acImgList=res.acImgList+ '#'+imgId
    	}
    	await mysql("cActivity").update({acImgList: res.acImgList}).where({acId})
		app.SqlSign=true
      	console.log('end'+app.SqlSign)
    	ctx.body={
    		url:'https://www.wxxcx.chaoswang.cn'+ctx.req.file.path.substr(1).substr(1)
    	}
        break
     }
   }
}
//修改完成

exports.GetAcImg=async (ctx, next) => {
    var acId=ctx.request.body.acId
    var res=await mysql("cActivity").where({acId}).first()
  	var imgGroups=res.acImgList.split("#")
	var imgList=[]
    for(var i=1;i<imgGroups.length;i++){
      	var acImgId=imgGroups[i]
    	imgList[imgList.length]=await mysql("cImages").where({acImgId})
    }
	
    ctx.body={
		imgList:imgList
    }
}

exports.UploadAcImg=upload