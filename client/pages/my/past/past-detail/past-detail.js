var cyto = require('../../../../加密工具/cyto.js')
var sha1 = require('../../../../加密工具/sha1.js')
var util = require('../../../../utils/util.js')
var app = getApp()
var date = new Date()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    acData: {},
    boolCreator: null
  },
  onShareAppMessage: function () {
    return {
      title: this.data.acts.name
    }
  },

  handleEnd: function () {
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
        util.check()
        wx.redirectTo({
          url: '../past/past',
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    util.check()
    this.setData({ boolCreator: wx.getStorageSync('boolCreator') })
    var acInfo = JSON.parse(options.acInfo)
    this.setData({
      acData: acInfo,
      'acData.acLocation': JSON.parse(acInfo.acLocation)
    })
    wx.setNavigationBarTitle({
      title: this.data.acData.acInfo.acName
    })  },

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
  onShareAppMessage: (res) => {
    if (res.from === 'button') {
      console.log("来自页面内转发按钮");
      console.log(res.target);
    }
    else {
      console.log("来自右上角转发菜单")
    }
    return {
      title: wx.getStorageSync('userinfo').nickName + '邀请您参加活动',
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
})