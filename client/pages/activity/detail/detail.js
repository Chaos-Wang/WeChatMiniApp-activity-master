var util = require('../../../utils/util.js')
var app = getApp()
var cyto = require('../../../加密工具/cyto.js')
var sha1 = require('../../../加密工具/sha1.js')
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
    acData:{},
    boolCreator:null
  },

 

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    util.check()
    this.setData({boolCreator:wx.getStorageSync('boolCreator')})
    console.log(this.data.boolCreator)
    options.acInfo = JSON.parse(options.acInfo)
    options.acInfo.acInfo = JSON.parse(options.acInfo.acInfo)
    options.acInfo.creatorInfo = JSON.parse(options.acInfo.creatorInfo)
    this.setData({
      acData: options.acInfo,
      'acData.acLocation': JSON.parse(options.acInfo.acLocation)
    })
    wx.setNavigationBarTitle({
      title: this.data.acData.acInfo.acName
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  handleEnd: function(){
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2];

    var openid = cyto.Encrypt(wx.getStorageSync('openid'))
    var acId = cyto.Encrypt(wx.getStorageSync('acId'))

    var token = date.format('yyyy-MM-dd') + acId + openid + date.format('yyyy-MM-dd')

    var token1 = date.format('yyyy-MM-dd') + acId + date.format('yyyy-MM-dd')
    var hash1 = sha1.sha1(token1)

    var hash = sha1.sha1(token)

    wx.request({
      url: 'https://www.wxxcx.chaoswang.cn/weapp/EndAc',
      data: {
        openid: openid,
        acId: acId
      },
      method: 'POST',
      header: {
        'content-type': 'application/json',
        token: hash
      },
      success(res) {
        wx.setStorage({
          key: 'bool_ing',
          data: false,
          success:function(){wx.navigateBack()}
        })
      }
    })
  },
  onShareAppMessage: (res) => {
    if (res.from === 'button') {
      console.log("来自页面内转发按钮");
      console.log(res.target);
    }
    else {
      console.log("来自右上角转发菜单")
    }
    return {
      title: wx.getStorageSync('userinfo').nickName+'邀请您参加活动',
      path: '/community/detail/detail',
      imageUrl: "/images/pd-faqiren.png",
      success: (res) => {
        console.log("转发成功", res);
      },
      fail: (res) => {
        console.log("转发失败", res);
      }
    }
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function (options) {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})