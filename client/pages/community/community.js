// pages/community/community.js
var util = require('../../utils/util.js')
var app = getApp()
var cyto = require('../../加密工具/cyto.js')
var sha1 = require('../../加密工具/sha1.js')
var date = new Date()
var util = require('../../utils/util.js')

Date.prototype.format = function (format) {
  var o = {
    "M+": this.getMonth() + 1, //month
    "d+": this.getDate(),    //day
    "h+": this.getHours(),   //hour
    "m+": this.getMinutes(), //minute
    "s+": this.getSeconds(), //second
    "q+": Math.floor((this.getMonth() + 3) / 3),  //quarter
    "S": this.getMilliseconds() //millisecond  postman
  }
  if (/(y+)/.test(format)) format = format.replace(RegExp.$1,
    (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o) if (new RegExp("(" + k + ")").test(format))
    format = format.replace(RegExp.$1,
      RegExp.$1.length == 1 ? o[k] :
        ("00" + o[k]).substr(("" + o[k]).length));
  return format;
}


Page({
  ac_info:'',
  data: {
    lists: [],
    imgUrls:[],
    empty:true
  },

  onLoad: function (options) {
    util.check()
  },

  onReady: function () {

  },

  onShow: function () {
    util.check()
    var that = this
    var token = date.format('yyyy-MM-dd') + cyto.Encrypt(wx.getStorageSync('openid')) + date.format('yyyy-MM-dd')
    var hash = sha1.sha1(token)
    wx.request({
      url: 'https://www.wxxcx.chaoswang.cn/weapp/GetCommunityAc',
      data: {
        openid: cyto.Encrypt(wx.getStorageSync('openid'))
      },
      method: 'POST',
      header: {
        'content-type': 'application/json',
        token: hash
      },
      success(res) {
        var raw_data = res.data.ac_info
        var lists=that.data.lists
        for(var i=0;i<raw_data.length;i++){
          raw_data[i].acInfo = JSON.parse(raw_data[i].acInfo)
          raw_data[i].creatorInfo = JSON.parse(raw_data[i].creatorInfo)
          if(raw_data[i].acInfo.acPublic&&raw_data[i].statusCode==0){
          if(lists.length==0){
            lists[0] = raw_data[i]
          }  
          else{
            for (var j=0;j<lists.length;j++){
              if(lists[j].acId==raw_data[i].acId)
                break
              if(j==that.data.lists.length-1)
                lists[lists.length]=raw_data[i]
            }
          }
        }
        }
        var urlLists=[]
        for(var i=0;i<lists.length;i++)
          urlLists[urlLists.length]=lists[i].imgUrl
        if(lists.length!=0)
          that.setData({
            empty:false
          })
        that.setData({
          lists:lists,
          imgUrls:urlLists
        })
      }
    })
  },

  navigateToDetail: function(e){
    wx.navigateTo({
      url: './detail/detail?acInfo='+JSON.stringify(e.currentTarget.dataset.acinfo),
    })
  },
  onHide: function () {

  },

  onUnload: function () {

  },

  onPullDownRefresh: function () {
    util.check()
    var that = this
    var token = date.format('yyyy-MM-dd') + cyto.Encrypt(wx.getStorageSync('openid')) + date.format('yyyy-MM-dd')
    var hash = sha1.sha1(token)
    wx.request({
      url: 'https://www.wxxcx.chaoswang.cn/weapp/GetCommunityAc',
      data: {
        openid: cyto.Encrypt(wx.getStorageSync('openid'))
      },
      method: 'POST',
      header: {
        'content-type': 'application/json',
        token: hash
      },
      success(res) {
        var raw_data = res.data.ac_info
        var lists = that.data.lists
        for (var i = 0; i < raw_data.length; i++) {
          raw_data[i].acInfo = JSON.parse(raw_data[i].acInfo)
          raw_data[i].creatorInfo = JSON.parse(raw_data[i].creatorInfo)
          if (raw_data[i].acInfo.acPublic && raw_data[i].statusCode == 0) {
            if (lists.length == 0) {
              lists[0] = raw_data[i]
            }
            else {
              for (var j = 0; j < lists.length; j++) {
                if (lists[j].acId == raw_data[i].acId)
                  break
                if (j == that.data.lists.length - 1)
                  lists[lists.length] = raw_data[i]
              }
            }
          }
        }
        var urlLists = []
        for (var i = 0; i < lists.length; i++)
          urlLists[urlLists.length] = lists[i].imgUrl
        if (lists.length != 0)
          that.setData({
            empty: false
          })
        that.setData({
          lists: lists,
          imgUrls: urlLists
        })
        wx.stopPullDownRefresh()
      }
    })
  },

  onReachBottom: function () {

  },

  onShareAppMessage: function () {

  },

})