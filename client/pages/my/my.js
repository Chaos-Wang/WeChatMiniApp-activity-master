// pages/my/my.js
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')

var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: '',
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  bindGetUserInfo: function () {
      // 首次登录
      qcloud.login({
        success: res => {
          this.setData({ userInfo: res ,logged: true})
          app.globalData.userInfo = res
          app.globalData.logged = true
          wx.setStorage({
            key: 'openid',
            data: res.openId,
          })
          wx.setStorage({
            key: 'userinfo',
            data: res,
          })
          wx.setStorageSync('logged', true)

          console.log('登录成功1')
        },
        fail: err => {
          console.error(err)
          console.log('登录失败1')
        }
      })

    },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    var logged = wx.getStorageSync('logged')
    if (wx.getStorageSync('logged')) {
      var userinfo_s=wx.getStorageSync('userinfo')
      this.setData({ userInfo: userinfo_s, logged: true })
    }
    const session = qcloud.Session.get()
    if (session) {
      qcloud.loginWithCode({
        success: res => {
          this.setData({ userInfo: res, logged: true })
          app.globalData.userInfo = res
          app.globalData.logged = true
          console.log('登录成功2')
          wx.setStorageSync('openid', res.openId)
          wx.setStorageSync('userinfo',res)
          wx.setStorageSync('logged', true)
        },
        fail: err => {
          console.error(err)
          console.log('登录失败2')
        }
      })
    }
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