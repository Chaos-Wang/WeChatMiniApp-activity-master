// pages/check/check.js
var date = new Date()
var currentHours = date.getHours()
var currentMinute = date.getMinutes();
var cyto = require('../../../加密工具/cyto.js')
var sha1 = require('../../../加密工具/sha1.js')
var util = require('../../../utils/util.js')

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
var QQMapWX = require('../../../utils/qqmap-wx-jssdk.js');
var qqmapsdk = new QQMapWX({
  key: 'N2TBZ-JL3LU-GJTV5-BKWAA-B4VAQ-A3BOY'
});
Page({
  /**
   * 页面的初始数据
   */
  data: {
    activity_title: "",
    ac_lat:null,
    ac_lng:null,
    location_res: "等待验证",
    location_check_res:null,
    location_disabled: false,
    markers: [{
      id: 0,
      latitude: null,
      longitude: null,
      label: {
        content: null,
        textAlign: "center"
      }
    }]
  },
  locationCheck: function () {
    var that = this;
    wx.getLocation({
      success: function (res) {
        var latitude = cyto.Encrypt(res.latitude)
        var longitude = cyto.Encrypt(res.longitude)
        var p1 = {
          user_lat: res.latitude,
          user_lng: res.longitude
        };
        var p2 = {
          ac_lat: that.data.ac_lat,
          ac_lng: that.data.ac_lng
        };
        console.log(p1, p2);
        qqmapsdk.calculateDistance({
          to: [{
            latitude: p1.user_lat,
            longitude: p1.user_lng
            }],
          from: {
            latitude: p2.ac_lat,
            longitude: p2.ac_lng
          },
          success: function (res) {
            var distance = res.result.elements[0].distance;
            if (distance <= 500) {
              that.setData({
                location_res: "验证成功",
                location_check_res :1
              });
              wx.showToast({
                title: '签到成功！',
                icon: 'success',
                duration: 2000
              })
            } else {
              that.location_check_res = 0;
              that.setData({
                location_res: "验证失败",
                location_check_res:0
              });
              wx.showToast({
                title: '签到失败，超出范围！',
                icon: 'none',
                duration: 2000
              })
            }
            var openid = cyto.Encrypt(wx.getStorageSync('openid'))
            var acId = cyto.Encrypt(wx.getStorageSync('acId'))
            var token = date.format('yyyy-MM-dd') + acId + latitude + longitude + openid + date.format('yyyy-MM-dd')
            var hash = sha1.sha1(token)
            wx.request({
              url: 'https://www.wxxcx.chaoswang.cn/weapp/MapShare',
              data: {
                openid: openid,
                acId: acId,
                latitude: latitude,
                longitude: longitude,
                location_check_res: that.data.location_check_res,
                flag:1
              },
              method: 'POST',
              header: {
                'content-type': 'application/json',
                token: hash
              },
              success(res){
                console.log("上传签到结果成功！")
              }
            })
            console.log(res.result.elements[0].distance);
            console.log(that.data.location_check_res);
            console.log(that.data.location_res);
            console.log(res);
          },
          fail: function (res) {
            console.log(res);
          },
        })
      },
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    util.check()
    var that = this
    var acId = cyto.Encrypt(wx.getStorageSync('acId'))
    var token = date.format('yyyy-MM-dd') + acId + date.format('yyyy-MM-dd')
    var hash = sha1.sha1(token)
    wx.request({
      url: 'https://www.wxxcx.chaoswang.cn/weapp/GetStandardLocation',
      data: {
        acId: acId
      },
      method: 'POST',
      header: {
        'content-type': 'application/json',
        token:hash
      },
      success(res) {
        console.log(res)
        res.data.acAddress = JSON.parse(res.data.acAddress)
        that.setData({
          ac_lat:res.data.acAddress.latitude,
          ac_lng:res.data.acAddress.longitude
        })
        that.setData({
          markers: [{
            id: 0,
            latitude: res.data.acAddress.latitude,
            longitude:res.data.acAddress.longitude,
            label: {
              content: res.data.acAddress.address,
              textAlign: "center"
            }
          }]
        })
        console.log(that.data.markers)
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