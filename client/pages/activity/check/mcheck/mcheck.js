// pages/check/mcheck/mcheck.js
var cyto = require('../../../../加密工具/cyto.js')
var sha1 = require('../../../../加密工具/sha1.js')
var util = require('../../../../utils/util.js')
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
    current:'tab1',
    tab1:true,
    tab2:false,
    checked:[],
    unchecked:[]
  },
  handleChange:function(e){
    this.setData({
      current:e.detail.key,
      tab1:!this.data.tab1,
      tab2:!this.data.tab2
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    util.check()
    var that = this
    var openid = cyto.Encrypt(wx.getStorageSync('openid'))
    var acId = cyto.Encrypt(wx.getStorageSync('acId'))
    var token = date.format('yyyy-MM-dd') + acId + openid + date.format('yyyy-MM-dd')
    var hash = sha1.sha1(token)
    wx.request({
      url: 'https://www.wxxcx.chaoswang.cn/weapp/CheckMangage',
      data: {
        openid: openid,
        acId: acId,
      },
      method: 'POST',
      header: {
        'content-type': 'application/json',
        token: hash
      },
      success(res) {
        var checked=[]
        var unchecked=[]
        for(var i=0;i<res.data.userLocation.length;i++){
          if (res.data.userLocation[i].userLocation.locationCheckRes==1)
            checked[checked.length] = res.data.userLocation[i]
          else  
            unchecked[unchecked.length] = res.data.userLocation[i]
        }
        that.setData({
          checked:checked,
          unchecked:unchecked
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

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