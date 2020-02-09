var util = require('../../../../utils/util.js')
var qcloud = require('../../../../vendor/wafer2-client-sdk/index')
var config = require('../../../../config')
var cyto = require('../../../../加密工具/cyto.js')
var sha1 = require('../../../../加密工具/sha1.js')
var date = new Date()
var pages = getCurrentPages()
var currPage = pages[pages.length - 1]
var prevPage = pages[pages.length - 2]

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
    payer: [],
    current: '',
    position: 'right',
    checked: false,
    disabled: false,
  },
  handlePayerChange({ detail = {} }) {
    this.setData({
      current: detail.value
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    util.check()      
    this.setData({
      current:options.payer
    })
    var acId = cyto.Encrypt(wx.getStorageSync('acId'))
    var token = date.format('yyyy-MM-dd') + acId + date.format('yyyy-MM-dd')
    var hash = sha1.sha1(token)
    var that=this
    wx.request({
      url: 'https://www.wxxcx.chaoswang.cn/weapp/GetMemberInfo',
      data: {
        acId: acId
      },
      method: 'POST',
      header: {
        'content-type': 'application/json',
        token: hash
      },

      success(res) {
        var payer=[]
        for(var i=0;i<res.data.memberInfo.length;i++){
          var item={
            id: i+1,
            src: res.data.memberInfo[i].memberAvatar,
            name: res.data.memberInfo[i].nickName,
            openid: res.data.memberInfo[i].openid
          }
          payer[payer.length]=item
        }
        that.setData({
          payer:payer
        })
      }
    })
  },
  submit: function () {
    var payer = {}
    var pages = getCurrentPages()
    var currPage = pages[pages.length - 1]
    var prevPage = pages[pages.length - 2]
    for (var i = 0; i < this.data.payer.length; i++) {
        if (this.data.payer[i].name == this.data.current) {
          payer = this.data.payer[i]
          break
        }
    }
    prevPage.setData({
      payer:payer
    })
    wx.navigateBack()
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