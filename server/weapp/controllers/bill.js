const { mysql } = require('../qcloud')
var request = require('urllib-sync').request;
var qs = require('querystring'); 
const crypto = require('crypto');
const aes = require('../tools/cyto');
const chinaTime = require('china-time');
var date = new Date();        
var app = require('../app.js')

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


exports.CreateBill=async (ctx, next) => {
    let req = ctx.request.body
	var hash_sha1=crypto.createHash("sha1")
    var token=date.format("yyyy-MM-dd")+ req.acId + req.billInfo +req.openid +date.format("yyyy-MM-dd")
    hash_sha1.update(token)
	var sha1c=hash_sha1.digest("hex")
  	if(ctx.request.header.token===sha1c)
    {	
        var openid=aes.Decrypt(req.openid)
        var acId=aes.Decrypt(req.acId)
        var billInfo=aes.Decrypt(req.billInfo)
        var res=await mysql("cActivity").where({acId}).first();
      	if(req.billPublic){
        	if(openid==res.creatorId){

			var billId=await mysql("cBill").insert({
                	billType:req.billType,
                  	billInfo:billInfo
                })
        	 
            while(true){
      			if(app.SqlSign){
    				var res=await mysql("cActivity").where({acId}).first();
    				if(res.acBillList=='#'){
      					res.acBillList='#'+billId
    				}else{
  	  					res.acBillList=res.acBillList+ '#'+billId
    				}
    				await mysql("cActivity").update({acBillList: res.acBillList}).where({acId})
					app.SqlSign=true
        			break
     			}
  		 	}
              ctx.response.status = 200;
            	ctx.body = {
                   code: 200,
                   msg: '账单创建成功',
               	}
        	
          
    		}else{
        		ctx.response.status = 201;
            	ctx.body = {
                   code: 416,
                   msg: '只有创始人可以上传账单信息',
               	}
        	}
       }else{
         	var billId=await mysql("cBill").insert({
                	billType:req.billType,
                  	billInfo:billInfo
                })
        	 
            while(true){
      			if(app.SqlSign){
    				var res=await mysql("cActivity").where({acId}).first();
    				if(res.acBillList=='#'){
      					res.acBillList='#'+billId
    				}else{
  	  					res.acBillList=res.acBillList+ '#'+billId
    				}
    				await mysql("cActivity").update({acBillList: res.acBillList}).where({acId})
					app.SqlSign=true
        			break
     			}
  		 	}
         ctx.response.status = 200;
            	ctx.body = {
                   code: 200,
                   msg: '账单创建成功',
               	}
        	
       		
       }
      }else{
        ctx.body = {
            code: 403,
            msg: '403 Forbidden'
         }
    }
 }

exports.GetPayerNickName=async (ctx, next) => {
        let req = ctx.request.body

                try{
						var open_id=req.openid
                        var res=await mysql("cSessionInfo").where({open_id}).first()
                        var user_info=JSON.parse(res.user_info)
                        var nickName=user_info.nickName
                  
                    ctx.response.status = 200;
                	ctx.body = {
                      	nickName:nickName,
                    	code: 200,
                    	msg: 'Success',
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

}

exports.GetBill=async (ctx, next) => {
    let req = ctx.request.body
	var hash_sha1=crypto.createHash("sha1")
    var token=date.format("yyyy-MM-dd")+ req.acId + req.openid +date.format("yyyy-MM-dd")
    console.log(token)
    hash_sha1.update(token)
	var sha1c=hash_sha1.digest("hex")
  	if(ctx.request.header.token===sha1c)
    {	
        var openid=aes.Decrypt(req.openid)
        var acId=aes.Decrypt(req.acId)
    	var res=await mysql("cActivity").where({acId}).first();
        var billGroups=res.acBillList.split("#")
		var personalBillList=[]
        var publicBillList=[]
    	for(var i=1;i<billGroups.length;i++){
      		var billId=billGroups[i]
    		var billInfo=await mysql("cBill").where({billId}).first()
            billInfo.billInfo=JSON.parse(billInfo.billInfo)
          	var open_id=billInfo.billInfo.payer
            
            var ress=await mysql("cSessionInfo").where({open_id}).first()
            var user_info=JSON.parse(ress.user_info)
            var nickName=user_info.nickName
            var item={
            	billInfo:billInfo,
              	nickName:nickName
            }            
            
            if(billInfo.billType=='false'){
              	if(billInfo.billInfo.payer==openid)
                  personalBillList[personalBillList.length]=item
            }else{
            	publicBillList[publicBillList.length]=item
            }
    	}	 
      
         ctx.response.status = 200;
         ctx.body = {
           	   publicList:publicBillList,
           	   personalList:personalBillList,
               code: 200,
               msg: '账单获取成功',
          }	
      }else{
        ctx.body = {
            code: 403,
            msg: '403 Forbidden'
         }
    }
 }