var util = require('../../utils/util.js')
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var cyto = require('../../加密工具/cyto.js')
var sha1 = require('../../加密工具/sha1.js')
var date=new Date()
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


  data: {
    ac_info: {},
    routers: [
      {
        name: '活动信息',
        url: '../bill/bill',
        type: 'document'
      },
      {
        name: '账本',
        url: './bill/bill',
        type: 'activity'
      },
      {
        name: '照片共享',
        url: './share/share',
        type: 'camera'
      },
      {
        name: '信息存储',
        url: './storage/storage',
        type: 'commodity'
      },
      {
        name: '位置共享',
        url: './mapshare/mapshare',
        type: 'share'
      },
      {
        name: '签到签退',
        url: './check/check',
        type: 'editor'
      },
    ],
    array: [{
      src: '../../images/billType/food.png'
    }, {
      src: '../../images/billType/hotel.png'
    }, {
        src: '../../images/billType/hotel.png'
    },{
        src: '../../images/billType/hotel.png'
    },{
        src: '../../images/billType/hotel.png'
    },{
        src: '../../images/billType/hotel.png'
    },{
        src: '../../images/billType/hotel.png'
    },{
        src: '../../images/billType/hotel.png'
    }
    ],

    bool_ing: '',

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    util.check()

  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function (options) {
    util.check()
    this.setData({
      bool_ing: wx.getStorageSync('bool_ing')
    })

    var that = this
    if (this.data.bool_ing) {
      var openid = cyto.Encrypt(wx.getStorageSync('openid'))
      var acId = cyto.Encrypt(wx.getStorageSync('acId'))

      var token = date.format('yyyy-MM-dd') + acId + openid + date.format('yyyy-MM-dd')

      var token1 = date.format('yyyy-MM-dd') + acId + date.format('yyyy-MM-dd')
      var hash1 = sha1.sha1(token1)

      var hash = sha1.sha1(token)

      wx.request({
        url: 'https://www.wxxcx.chaoswang.cn/weapp/GetAc',
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
          var routers=[]
          if (wx.getStorageSync('boolCreator') == false) {
            routers = [
              {
                name: '活动信息',
                url: './detail/detail?acInfo=' + JSON.stringify(res.data.acInfo),
                type: 'document'
              },
              {
                name: '账本',
                url: './bill/bill?header=' + JSON.parse(res.data.acInfo.acInfo).acName,
                type: 'activity'
              },
              {
                name: '照片共享',
                url: './share/share',
                type: 'camera'
              },
              {
                name: '信息存储',
                url: './storage/storage',
                type: 'commodity'
              },
              {
                name: '位置共享',
                url: './mapshare/mapshare',
                type: 'share'
              },
              {
                name: '签到签退',
                url: './check/check',
                type: 'editor'
              },
            ]
          } else {
            routers = [
              {
                name: '活动信息',
                url: './detail/detail?acInfo=' + JSON.stringify(res.data.acInfo),
                type: 'document'
              },
              {
                name: '账本',
                url: './bill/bill?header=' + JSON.parse(res.data.acInfo.acInfo).acName,
                type: 'activity'
              },
              {
                name: '照片共享',
                url: './share/share',
                type: 'camera'
              },
              {
                name: '信息存储',
                url: './storage/storage',
                type: 'commodity'
              },
              {
                name: '位置共享',
                url: './mapshare/mapshare',
                type: 'share'
              },
              {
                name: '签到签退',
                url: './check/mcheck/mcheck',
                type: 'editor'
              },
            ]
          }
          that.setData({ routers: routers })
          res.data.acInfo.acInfo = JSON.parse(res.data.acInfo.acInfo)
          res.data.acInfo.creatorInfo = JSON.parse(res.data.acInfo.creatorInfo)
          that.setData({ ac_info: res.data.acInfo })
        }
      })
      wx.request({
        url: 'https://www.wxxcx.chaoswang.cn/weapp/GetMemberAvatar',
        data: {
          acId: acId
        },
        method: 'POST',
        header: {
          'content-type': 'application/json',
          token: hash1
        },

        success(res) {
          that.setData({
            imgUrl: res.data.imgUrl
          })
        }
      })
    }
  }
})