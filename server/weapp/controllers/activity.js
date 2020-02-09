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
//修改完成
exports.AsyncCreateAc=async (ctx, next) => {
    let req = ctx.request.body
	var hash_sha1=crypto.createHash("sha1")
    var token=date.format("yyyy-MM-dd")+req.acInfo+req.acLocation+req.creatorId+req.creatorInfo+req.memberList+date.format("yyyy-MM-dd")
    hash_sha1.update(token)
	var sha1c=hash_sha1.digest("hex")
  	if(ctx.request.header.token===sha1c)
    {	
        var acInfo=JSON.parse(aes.Decrypt(req.acInfo))
        var creatorInfo=JSON.parse(aes.Decrypt(req.creatorInfo))
        var startTime = new Date(Date.parse(acInfo.startTime))
        var deadlineTime = new Date(Date.parse(acInfo.deadlineTime))
        
        if(deadlineTime<startTime){
		
        var open_id = req.creatorId
        var res_s=await mysql("cSessionInfo").where({open_id}).first()
        
         try{
             var acId = await mysql("cActivity").insert({  acInfo:JSON.stringify(acInfo),
                                                      		creatorId:req.creatorId,
                                                     		creatorInfo:JSON.stringify(creatorInfo),
                                                            memberList:req.memberList,
                                                          	acLocation:req.acLocation,
                                                          	statusCode:0})
             if(res_s.joinedAc=='#'){
             	res_s.joinedAc=res_s.joinedAc+acId
             }else{
             	res_s.joinedAc = res_s.joinedAc + '#' +acId
             }
             await mysql("cSessionInfo").update({joinedAc:res_s.joinedAc}).where({open_id})
             ctx.response.status = 200
             ctx.body = {
                  acId:acId,
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
    	}else{
        	ctx.response.status = 200;
            ctx.body = {
                   code: 416,
                   msg: '报名截止时间需要在活动开始时间之前',
               	}
        }
        }
     else{
        ctx.body = {
            code: 403,
            msg: '403 Forbidden'
         }
    }
 }
//修改完成
exports.GetCommunityAc=async (ctx, next) => {
        let req = ctx.request.body
		var hash_sha1=crypto.createHash("sha1")
      	var token=date.format("yyyy-MM-dd")+req.openid+date.format("yyyy-MM-dd")
      	hash_sha1.update(token)
		var sha1c=hash_sha1.digest("hex")

      	//解密          
		if(ctx.request.header.token===sha1c)
        {	
                try{
                  	var ac_info = await mysql("cActivity")
					for(var i=0;i<ac_info.length;i++){
                    	var acImgId=(ac_info[i].acImgList.split('#'))[1]
                        var imgUrl=(await mysql("cImages").where({acImgId}))[0].acImgUrl
                        ac_info[i].imgUrl=imgUrl
                    }
                    ctx.response.status = 200;
               	 	ctx.body = {
                      	ac_info:ac_info,
                    	code: 200,
                    	msg: '操作成功',
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
//修改完成
exports.GetHistoryAc=async (ctx, next) => {
        let req = ctx.request.body
		var hash_sha1=crypto.createHash("sha1")
      	var token=date.format("yyyy-MM-dd")+req.openid+date.format("yyyy-MM-dd")
      	hash_sha1.update(token)
		var sha1c=hash_sha1.digest("hex")

      	//解密          
		if(ctx.request.header.token===sha1c)
        {	
                try{
                  	var open_id=aes.Decrypt(req.openid)
					var res=await mysql("cSessionInfo").where({open_id}).first()
                    
                    var acGroups=res.joinedAc.split("#")
                    
                    var data=[]
                    var joinAc=[]
                    var currAc=[]
                    var endAc=[]
                    for(var i=1;i<acGroups.length;i++){
                      	var acId=acGroups[i]
                    	var ac = await mysql("cActivity").where({acId}).first()
                        
						var acImgId=(ac.acImgList.split('#'))[1]
                        var imgUrl=(await mysql("cImages").where({acImgId}))[0].acImgUrl
                        ac.imgUrl=imgUrl
                      
                        if(ac.statusCode==3)
                            endAc[endAc.length]=ac
                        else if(ac.statusCode==2)
                            currAc[currAc.length]=ac
                        else
                            joinAc[joinAc.length]=ac
                    }

                  
                  	data[0]=joinAc
                  	data[1]=currAc
                  	data[2]=endAc
                    ctx.response.status = 200;
               	 	ctx.body = {
                      	ac:data,
                    	code: 200,
                    	msg: '操作成功',
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
//修改完成
exports.JoinAc=async (ctx, next) => {
        let req = ctx.request.body
		var hash_sha1=crypto.createHash("sha1")
      	var token=date.format("yyyy-MM-dd")+req.acId+req.openid+date.format("yyyy-MM-dd")
      	hash_sha1.update(token)
		var sha1c=hash_sha1.digest("hex")
		  
      	//解密          
		if(ctx.request.header.token===sha1c)
        {	
                try{
                  	var acId=aes.Decrypt(req.acId)
        			var open_id=aes.Decrypt(req.openid)
					var res=await mysql("cActivity").where({acId}).first();
                  	var res_s=await mysql("cSessionInfo").where({open_id}).first();
                    res.acInfo=JSON.parse(res.acInfo)
                    var memberList=res.memberList.split('#')
                    
                      for(var j=1;j < memberList.length;j++){
                        if(res.acInfo.acNum > 0 ){
                        	if(memberList[j]==open_id){
                              	ctx.response.status = 200;
               	 				ctx.body = {
                      				tag:false,
                    				code: 200,
                    				msg: '操作失败，该用户已经报名',
                                }
                          		break
                            }
                        	if(j==memberList.length-1){
                              if(res_s.joinedAc=='#'){
                                res_s.joinedAc = res_s.joinedAc + acId
                              }else{
                              	res_s.joinedAc =res_s.joinedAc+'#'+acId
                              }
      							res.memberList=res.memberList + '#'+open_id
                              	res.acInfo.acNum--
                                ctx.response.status = 200;
               	 				ctx.body = {
                      				tag:true,
                    				code: 200,
                    				msg: '操作成功',
                    			}
                        	}
                      	}else{
                        	ctx.response.status = 200;
               	 			ctx.body = {
                      			tag:false,
                    			code: 200,
                    			msg: '操作失败，活动人数已满',
               				}
                        }
                      }
    				
                  
                    await mysql("cActivity").update({memberList:res.memberList}).where({acId})
                    await mysql("cSessionInfo").update({joinedAc:res_s.joinedAc}).where({open_id})
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
      	else{
       		console.log('接口身份验证失败')
        	ctx.body = {
                tag:false,
                code: 403,
               	msg: '403 Forbidden'
          	}
    	}
}
//修改完成
exports.GetMemberAvatar=async (ctx, next) => {
        let req = ctx.request.body
		var hash_sha1=crypto.createHash("sha1")
      	var token=date.format("yyyy-MM-dd")+req.acId+date.format("yyyy-MM-dd")
      	hash_sha1.update(token)
		var sha1c=hash_sha1.digest("hex")
		  
      	//解密          
		if(ctx.request.header.token===sha1c)
        {	
                try{
                  	var acId=aes.Decrypt(req.acId)
					var res=await mysql("cActivity").where({acId}).first();
                    var memberList=res.memberList.split('#')
                    var imgUrl=[]
                    
                      for(var j=1;j < memberList.length;j++){
                        var open_id=memberList[j]
                        var res_s=await mysql("cSessionInfo").where({open_id}).first()
                        var user_info=JSON.parse(res_s.user_info)
                        imgUrl[imgUrl.length]=user_info.avatarUrl
                      }
                  
                    ctx.response.status = 200;
                	ctx.body = {
                      	imgUrl:imgUrl,
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
      	else{
       		console.log('接口身份验证失败')
        	ctx.body = {
                tag:false,
                code: 403,
               	msg: '403 Forbidden'
          	}
    	}
}

exports.GetMemberInfo=async (ctx, next) => {
        let req = ctx.request.body
		var hash_sha1=crypto.createHash("sha1")
      	var token=date.format("yyyy-MM-dd")+req.acId+date.format("yyyy-MM-dd")
      	hash_sha1.update(token)
		var sha1c=hash_sha1.digest("hex")
		  
      	//解密          
		if(ctx.request.header.token===sha1c)
        {	
                try{
                  	var acId=aes.Decrypt(req.acId)
					var res=await mysql("cActivity").where({acId}).first();
                    var memberList=res.memberList.split('#')
                    var memberInfo=[]
                    
                      for(var j=1;j < memberList.length;j++){
                        var open_id=memberList[j]
                        var res_s=await mysql("cSessionInfo").where({open_id}).first()
                        var user_info=JSON.parse(res_s.user_info)
                        var item={
                        	memberAvatar:user_info.avatarUrl,
                          	nickName:user_info.nickName,
                          	openid:res_s.open_id
                        }
                        memberInfo[memberInfo.length]=item
                      }
                  
                    ctx.response.status = 200;
                	ctx.body = {
                      	memberInfo:memberInfo,
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
      	else{
       		console.log('接口身份验证失败')
        	ctx.body = {
                tag:false,
                code: 403,
               	msg: '403 Forbidden'
          	}
    	}
}

exports.DeleteAc=async (ctx, next) => {
        let req = ctx.request.body
		var hash_sha1=crypto.createHash("sha1")
      	var token=date.format("yyyy-MM-dd")+req.acid+req.openid+date.format("yyyy-MM-dd")
      	hash_sha1.update(token)
		var sha1c=hash_sha1.digest("hex")
		  
      	//解密          
		if(ctx.request.header.token===sha1c)
        {	
                try{
                  	var ac_id=aes.Decrypt(req.ac_id)
        			var openid=aes.Decrypt(req.openid)
                    
					var res=await mysql("cActivity").where({ac_id}).first();
                  	if(openid==res.creatorId){
                    	await mysql("cActivity").del().where({ ac_id })

                    	ctx.response.status = 200;
               	 		ctx.body = {
                      		tag:true,
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
        }
      	else{
       		console.log('接口身份验证失败')
        	ctx.body = {
                tag:false,
                code: 403,
               	msg: '403 Forbidden'
          	}
    	}
}

exports.BoolIn=async (ctx, next) => {
        let req = ctx.request.body
		var hash_sha1=crypto.createHash("sha1")
      	var token=date.format("yyyy-MM-dd")+req.acid+req.openid+date.format("yyyy-MM-dd")
      	hash_sha1.update(token)
		var sha1c=hash_sha1.digest("hex")
		  
      	//解密          
		if(ctx.request.header.token===sha1c)
        {	
                try{
                  	var ac_id=aes.Decrypt(req.ac_id)
        			var openid=aes.Decrypt(req.openid)
                    
                  	var res=await mysql("cSessionInfo").where({openid}).first()
                    var acGroups=res.joined_ac.split("#")
                    for(var i of acGroups){
                  		if(i==ac_id){
                    		ctx.response.status = 200;
               	 			ctx.body = {
                      			tag:true,
                    			code: 200,
                    			msg: '操作成功',
               				}
                          break
                    	}
                            ctx.response.status = 200;
               	 			ctx.body = {
                      			tag:false,
                    			code: 200,
                    			msg: '操作成功',
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
        }
      	else{
       		console.log('接口身份验证失败')
        	ctx.body = {
                tag:false,
                code: 403,
               	msg: '403 Forbidden'
          	}
    	}
}

exports.BoolBusy=async (ctx, next) => {
        let req = ctx.request.body
		var hash_sha1=crypto.createHash("sha1")
      	var token=date.format("yyyy-MM-dd")+req.openid+date.format("yyyy-MM-dd")
      	hash_sha1.update(token)
		var sha1c=hash_sha1.digest("hex")
		  
      	//解密          
		if(ctx.request.header.token===sha1c)
        {	
                try{
        			var open_id=aes.Decrypt(req.openid)
                    
                  	var res=await mysql("cSessionInfo").where({open_id}).first()
                    if(res.joinedAc=='#'){
                    	ctx.response.status = 200;
               	 			ctx.body = {
                      			tag:false,
                              	ac_id:null,
                    			code: 200,
                    			msg: '操作成功',
               				}
                    }else{
                    var acGroups=res.joinedAc.split("#")
                    for(var i=1;i<=acGroups.length-1;i++){
                        var acId=acGroups[i]
                      	var ac=await mysql("cActivity").where({acId}).first()
                        ac.acInfo=JSON.parse(ac.acInfo)
                      	ac.creatorInfo=JSON.parse(ac.creatorInfo)
                      
                        var boolCreator=null
                  		if(ac.statusCode==2){
                          if(ac.creatorId==open_id)
                          	boolCreator=true
                      	  else
                          	boolCreator=false
                          
                    		ctx.response.status = 200;
               	 			ctx.body = {
                              	boolCreator:boolCreator,
                      			tag:true,
                              	ac_id:acId,
                    			code: 200,
                    			msg: '操作成功',
               				}
                          break
                    	}
                            ctx.response.status = 200;
               	 			ctx.body = {
                              	boolCreator:null,
                      			tag:false,
                              	ac_id:null,
                    			code: 200,
                    			msg: '操作成功',
               				}
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
        }
      	else{
       		console.log('接口身份验证失败')
        	ctx.body = {
                tag:false,
                code: 403,
               	msg: '403 Forbidden'
          	}
    	}
}

exports.BoolEnd=async (ctx, next) => {
        let req = ctx.request.body
		var hash_sha1=crypto.createHash("sha1")
      	var token=date.format("yyyy-MM-dd")+req.acid+date.format("yyyy-MM-dd")
      	hash_sha1.update(token)
		var sha1c=hash_sha1.digest("hex")
		  
      	//解密          
		if(ctx.request.header.token===sha1c)
        {	
                try{
        			var ac_id=aes.Decrypt(req.acid)
                    var ac=await mysql("cActivity").where({ac_id}).first();
                  		if(ac.statusCode==3){
                    		ctx.response.status = 200;
               	 			ctx.body = {
                      			tag:true,
                    			code: 200,
                    			msg: '操作成功',
               				}
                        }else{
                            ctx.response.status = 200;
               	 			ctx.body = {
                      			tag:false,
                    			code: 200,
                    			msg: '操作成功',
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
        }
      	else{
       		console.log('接口身份验证失败')
        	ctx.body = {
                tag:false,
                code: 403,
               	msg: '403 Forbidden'
          	}
    	}
}

exports.BoolIng=async (ctx, next) => {
        let req = ctx.request.body
		var hash_sha1=crypto.createHash("sha1")
      	var token=date.format("yyyy-MM-dd")+req.acid+date.format("yyyy-MM-dd")
      	hash_sha1.update(token)
		var sha1c=hash_sha1.digest("hex")
		  
      	//解密          
		if(ctx.request.header.token===sha1c)
        {	
                try{
        			var ac_id=aes.Decrypt(req.acid)
                    var ac=await mysql("cActivity").where({ac_id}).first();
                  		if(ac.statusCode==2){
                    		ctx.response.status = 200;
               	 			ctx.body = {
                      			tag:true,
                    			code: 200,
                    			msg: '操作成功',
               				}
                        }else{
                            ctx.response.status = 200;
               	 			ctx.body = {
                      			tag:false,
                    			code: 200,
                    			msg: '操作成功',
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
        }
      	else{
       		console.log('接口身份验证失败')
        	ctx.body = {
                tag:false,
                code: 403,
               	msg: '403 Forbidden'
          	}
    	}
}

exports.EndAc=async (ctx, next) => {
        let req = ctx.request.body
		var hash_sha1=crypto.createHash("sha1")
      	var token=date.format("yyyy-MM-dd")+req.acId+req.openid+date.format("yyyy-MM-dd")
      	hash_sha1.update(token)
		var sha1c=hash_sha1.digest("hex")
		  
      	//解密          
		if(ctx.request.header.token===sha1c)
        {	
                try{
                  	var acId=aes.Decrypt(req.acId)
        			var openid=aes.Decrypt(req.openid)
                    
					var res=await mysql("cActivity").where({acId}).first();
                  	if(openid==res.creatorId){
                    	await mysql("cActivity").update({statusCode:3}).where({ acId })

                    	ctx.response.status = 200;
               	 		ctx.body = {
                      		tag:true,
                    		code: 200,
                    		msg: '操作成功',
               			}
                    }
					else{
                        ctx.response.status = 200;
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
        }
      	else{
       		console.log('接口身份验证失败')
        	ctx.body = {
                tag:false,
                code: 403,
               	msg: '403 Forbidden'
          	}
    	}
}

//修改完成
exports.GetAc=async (ctx, next) => {
 		let req = ctx.request.body
		var hash_sha1=crypto.createHash("sha1")
      	var token=date.format("yyyy-MM-dd")+req.acId+req.openid+date.format("yyyy-MM-dd")
      	hash_sha1.update(token)
		var sha1c=hash_sha1.digest("hex")
		  
      	//解密          
		if(ctx.request.header.token===sha1c)
        {	
                try{
                  	var acId=aes.Decrypt(req.acId)
        			var openid=aes.Decrypt(req.openid)
					var res=await mysql("cActivity").where({acId}).first();
                  
                    var acImgId=(res.acImgList.split('#'))[1]
                    var imgUrl=(await mysql("cImages").where({acImgId}))[0].acImgUrl
                    res.imgUrl=imgUrl
                    	ctx.response.status = 200;
               	 		ctx.body = {
                      		tag:true,
                          	acInfo:res,
                    		code: 200,
                    		msg: '操作成功',
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
      	else{
       		console.log('接口身份验证失败')
        	ctx.body = {
                tag:false,
                code: 403,
               	msg: '403 Forbidden'
          	}
    	}
}