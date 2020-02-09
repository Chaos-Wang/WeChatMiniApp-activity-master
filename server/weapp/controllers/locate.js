const { mysql } = require('../qcloud')
var request = require('urllib-sync').request;
var qs = require('querystring'); 
const crypto = require('crypto');
const aes = require('../tools/cyto');
const chinaTime = require('china-time');
var date = new Date();        

Date.prototype.format = function(format)
{
 var o = {
 "M+" : this.getMonth()+1, //month
 "d+" : this.getDate(),    //day
 "h+" : this.getHours(),   //hour
 "m+" : this.getMinutes(), //minute
 "s+" : this.getSeconds(), //second
 "q+" : Math.floor((this.getMonth()+3)/3),  //quarter
 "S" : this.getMilliseconds() //millisecond  postman
 }
 if(/(y+)/.test(format)) format=format.replace(RegExp.$1,
 (this.getFullYear()+"").substr(4 - RegExp.$1.length));
 for(var k in o)if(new RegExp("("+ k +")").test(format))
 format = format.replace(RegExp.$1,
 RegExp.$1.length==1 ? o[k] :
 ("00"+ o[k]).substr((""+ o[k]).length));
 return format;
}


class locate
{
  //修改完成

  static async GetStandardLocation(ctx)
  	{
        let req = ctx.request.body;
        var acId = req.acId; 
      	
		var hash_sha1=crypto.createHash("sha1");
      	var token=date.format("yyyy-MM-dd")+ acId +date.format("yyyy-MM-dd")
      	hash_sha1.update(token);
		var sha1c=hash_sha1.digest("hex");
        acId = aes.Decrypt(req.acId) 

      	//解密          
		if(ctx.request.header.token===sha1c)
        {
      		var res=await mysql("cActivity").where({acId}).first()
                try{
                    ctx.response.status = 200;
               	 	ctx.body = {
                      	acAddress:res.acLocation,
                    	code: 200,
                    	msg: '操作成功'
               		}
              	}catch(err){
                  console.log(err)
                    ctx.response.status = 416;
                	ctx.body = {
                    	code: 416,
                    	msg: '预期内错误',
               	 	}
        	 	}
        }
      	else{
       		console.log('接口身份验证失败')
        	ctx.body = {
                code: 403,
               	msg: '403 Forbidden'
          	}
    	}
    }
  
    static async MapShare(ctx)
  	{
        let req = ctx.request.body;
		var hash_sha1=crypto.createHash("sha1");
      	var token=date.format("yyyy-MM-dd")+req.acId+req.latitude+req.longitude+req.openid+date.format("yyyy-MM-dd")
        hash_sha1.update(token)
		var sha1c=hash_sha1.digest("hex")
        var open_id=aes.Decrypt(req.openid)
        var acId=aes.Decrypt(req.acId)
        if(ctx.request.header.token===sha1c){
          	var res=await mysql("cActivity").where({acId}).first()
            
            res.acInfo=JSON.parse(res.acInfo)
            var locationCheckRes=null
            if(typeof res.acInfo.UsersLocation!='undefined'){
            for(var i=0;i < res.acInfo.UsersLocation.length;i++){
                if( res.acInfo.UsersLocation[i].userId == open_id){
					locationCheckRes=res.acInfo.UsersLocation[i].locationCheckRes
                    break
                }
            	}
            
          	var checkRes=null
          	if(req.flag==0){
            	checkRes=locationCheckRes
            }else{
            	checkRes=req.location_check_res
            }
            }else{
            	checkRes=req.location_check_res
            }
    		var item={
                      'userId':open_id,
                      'latitude':aes.Decrypt(req.latitude),
                      'longitude':aes.Decrypt(req.longitude),
              		  'locationCheckRes':checkRes
            }
            
          
  			if(typeof  res.acInfo.UsersLocation != 'undefined'){
				for(var i=0;i < res.acInfo.UsersLocation.length;i++){
                	if( res.acInfo.UsersLocation[i].userId == open_id){
                    	res.acInfo.UsersLocation[i].latitude=aes.Decrypt(req.latitude)
                      	res.acInfo.UsersLocation[i].longitude=aes.Decrypt(req.longitude)
                      	res.acInfo.UsersLocation[i].locationCheckRes=checkRes
                      	break
                    }
                  	if(i==res.acInfo.UsersLocation.length-1){
                      res.acInfo.UsersLocation[res.acInfo.UsersLocation.length]=item
                    }
                }
    		}
 			else{
              	res.acInfo.UsersLocation=[]
      			res.acInfo.UsersLocation[0]=item
    		}
          	await mysql("cActivity").update({acInfo:JSON.stringify(res.acInfo)}).where({acId})
          	
          	var userData=[]
			var res=await mysql("cActivity").where({acId}).first()
			res.acInfo=JSON.parse(res.acInfo)
			for(var i=0;i<res.acInfo.UsersLocation.length;i++){
              var open_id=res.acInfo.UsersLocation[i].userId
              var resInfo=await mysql("cSessionInfo").where({open_id}).first()
			  resInfo.user_info=JSON.parse( resInfo.user_info)
              var item={
              	userLocation:res.acInfo.UsersLocation[i],
                userAvatar:resInfo.user_info.avatarUrl,
                userNickName:resInfo.user_info.nickName
              }
             userData[userData.length]=item
            }
    		ctx.body={
    			locate:userData
    		}
          
        }
      	else{
        	ctx.body = {
                code: 403,
               	msg: '403 Forbidden'
          	}
    	}
    }
  
  static async CheckMangage(ctx)
  	{
        let req = ctx.request.body;
		var hash_sha1=crypto.createHash("sha1");
      	var token=date.format("yyyy-MM-dd")+ req.acId + req.openid+date.format("yyyy-MM-dd")
        hash_sha1.update(token)
		var sha1c=hash_sha1.digest("hex")
        
        var open_id=aes.Decrypt(req.openid)
        var acId=aes.Decrypt(req.acId)
        
        if(ctx.request.header.token===sha1c){
           	try{
				var res=await mysql("cActivity").where({acId}).first();
             	res.acInfo=JSON.parse(res.acInfo)
				
                if(open_id==res.creatorId){
                  
                  		var InfoData=[]
						for(var i=0;i<res.acInfo.UsersLocation.length;i++){
                        	var open_id=res.acInfo.UsersLocation[i].userId
							var resInfo=await mysql("cSessionInfo").where({open_id}).first()
                            resInfo.user_info=JSON.parse( resInfo.user_info)
							var item={
              					userLocation:res.acInfo.UsersLocation[i],
                				userAvatar:resInfo.user_info.avatarUrl,
               	 				userNickName:resInfo.user_info.nickName
              				}
                            InfoData[InfoData.length]=item
                        }
                    	ctx.response.status = 200;
               	 		ctx.body = {
                      		tag:true,
                          	userLocation:InfoData,
                    		code: 200,
                    		msg: '操作成功',
               			}
                    }
					else{
                        ctx.response.status = 403;
               	 		ctx.body = {
                      		tag:false,
                    		code: 403,
                    		msg: '操作失败,用户不是该活动的创始人',
               			}
                    }
              	}catch(err){
                  console.log(err)
                    ctx.response.status = 416;
                	ctx.body = {
                      	tag:false,
                    	code: 416,
                    	msg: '预期内错误',
               	 	}
        	 	}
        }else{
        	ctx.body = {
                code: 403,
               	msg: '403 Forbidden'
          	}
    	}
    }

}
module.exports = locate;