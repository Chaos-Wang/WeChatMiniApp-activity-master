// pages/past/past.js
var cyto = require('../../../加密工具/cyto.js')
var sha1 = require('../../../加密工具/sha1.js')
var util = require('../../../utils/util.js')
var app = getApp()
var date = new Date()

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

  /**
   * 页面的初始数据
   */
  data: {
    ac: '',
    current: 'tab1',
    tab:[true,false,false],
    empty:[true,true,true]
  },
  handleChange({ detail }) {
    var tag = Number(detail.key[3])-1
    var tabs= this.data.tab
    for(var i=0;i<3;i++)
      if(tabs[i]==true){
        tabs[tag]=true
        tabs[i]=false
        break
      }

      this.setData({
        current:detail.key,
        tab: tabs
      })
  },
  
  navigateToDetail: function (e) {
    console.log(e)
    wx.navigateTo({
      url: './past-detail/past-detail?acInfo=' + JSON.stringify(e.currentTarget.dataset.acinfo),
    })
  },

  onLoad: function (options) {
    util.check()
    var that = this
    var token = date.format('yyyy-MM-dd') + cyto.Encrypt(wx.getStorageSync('openid')) + date.format('yyyy-MM-dd')
    var hash = sha1.sha1(token)
    wx.request({
      url: 'https://www.wxxcx.chaoswang.cn/weapp/GetHistoryAc',
      data: {
        openid: cyto.Encrypt(wx.getStorageSync('openid'))
      },
      method: 'POST',
      header: {
        'content-type': 'application/json',
        token: hash
      },
      success(res) {
        for(var i=0;i<3;i++)
          for(var j=0;j<res.data.ac[i].length;j++){
            console.log()
            res.data.ac[i][j].acInfo = JSON.parse(res.data.ac[i][j].acInfo)
            res.data.ac[i][j].creatorInfo = JSON.parse(res.data.ac[i][j].creatorInfo)
          }
        that.setData({
          ac:res.data.ac
        })
        var empty=that.data.empty
        if(res.data.ac[0].length!=0)
          empty[0]=false
        if (res.data.ac[1].length != 0)
          empty[1]=false
        if (res.data.ac[2].length != 0)
          empty[2]=false
        that.setData({
          empty: empty
        })
      }
    })
  },

  onReady: function () {

  }
})