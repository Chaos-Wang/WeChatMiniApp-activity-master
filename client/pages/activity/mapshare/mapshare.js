// pages/share/share.js
var date = new Date()
var currentHours = date.getHours()
var currentMinute = date.getMinutes();
var cyto = require('../../../加密工具/cyto.js')
var sha1 = require('../../../加密工具/sha1.js')
const { $Toast } = require('../../../dist/base/index')
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
    latitude:null,
    longitude:null,
    markers:[],
    compare:[],
    avatarUrl:{},
    nickName:{},
    tolatitude:null,
    tolongitude:null,
    polyline:[],
  },
  Refresh:function(){
    var that=this
    that.onLoad()
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    util.check()
    var that = this
    wx.getLocation({
      type: 'gcj02',
      altitude: true,
      success: function (res) {
        that.setData({ latitude: String(res.latitude) })
        that.setData({ longitude: String(res.longitude) })

        var openid = cyto.Encrypt(wx.getStorageSync('openid'))
        var acId = cyto.Encrypt(wx.getStorageSync('acId'))
        var latitude = cyto.Encrypt(that.data.latitude)
        var longitude = cyto.Encrypt(that.data.longitude)

        var token = date.format('yyyy-MM-dd') + acId + latitude + longitude + openid + date.format('yyyy-MM-dd')

        var hash = sha1.sha1(token)

        wx.request({
          url: 'https://www.wxxcx.chaoswang.cn/weapp/MapShare',
          data: {
            openid: openid,
            acId: acId,
            latitude: latitude,
            longitude: longitude,
            location_check_res: 2,
            flag:0
          },
          method: 'POST',
          header: {
            'content-type': 'application/json',
            token: hash
          },
          success(res) {
            console.log(res)
            console.log('成功上传')
            var markers=[]
            var compare=[]
            for(var i=0;i<res.data.locate.length;i++)
            {
              var item={}
              item.id=i
              item.latitude = res.data.locate[i].userLocation.latitude
              item.longitude = res.data.locate[i].userLocation.longitude
              item.label={}
              item.label.content=res.data.locate[i].userNickName
              item.label.textAlign="center"
              markers[markers.length]=item
              var item1={}
              item1.marker1=item
              item1.avatarUrl=res.data.locate[i].userAvatar
              item1.nickName=res.data.locate[i].userNickName
              compare[compare.length]=item1
            }
            that.setData({
              markers:markers,
              compare:compare
            })
            console.log(that.data.markers)
          }
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
    wx.getSetting({
      success(res) {
        //地理位置
        if (!res.authSetting['scope.userLocation']) {
          wx.authorize({
            scope: 'scope.userLocation',
            success(res) {
              wx.getLocation();
            },
            fail() {
              wx.showModal({
                title: '提示',
                content: '定位失败，你未开启定位权限，点击开启定位权限',
                success: function (res) {
                  if (res.confirm) {
                    wx.openSetting({
                      success: function (res) {
                        if (res.authSetting['scope.userLocation']) {
                          wx.getLocation();
                        } else {
                          console.log('用户未同意地理位置权限')
                        }
                      }
                    })
                  }
                }
              })
            }
          })
        } else {
          wx.getLocation();
        }
      }
    })
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

  },
  showModal: function (event) {
    // 
    console.log(event)
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation
    animation.translateY(300).step()
    this.setData({
      animationData: animation.export(),
      showModalStatus: true
    })
    setTimeout(function () {
      animation.translateY(0).step()
      this.setData({
        animationData: animation.export()
      })
    }.bind(this), 200)
    console.log(this.data.compare)
    for(var i=0;i<this.data.compare.length;i++)
    {
      if(this.data.compare[i].marker1.id==event.markerId)
      {
        this.setData({
          avatarUrl:this.data.compare[i].avatarUrl,
          nickName:this.data.compare[i].nickName,
          tolatitude: this.data.compare[i].marker1.latitude,
          tolongitude:this.data.compare[i].marker1.longitude
        })
      }
    }
  },


  //隐藏对话框
  hideModal: function () {
    // 隐藏遮罩层
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation
    animation.translateY(300).step()
    this.setData({
      animationData: animation.export(),
    })
    setTimeout(function () {
      animation.translateY(0).step()
      this.setData({
        animationData: animation.export(),
        showModalStatus: false
      })
    }.bind(this), 200)
  },
  route:function(){
    var _this=this
    console.log(this.data)
    qqmapsdk.direction({
      mode:"walking",
      from:{
        latitude:this.data.latitude,
        longitude:this.data.longitude
      },
      to:{
        latitude: this.data.tolatitude,
        longitude:this.data.tolongitude
      },
      success: function (res) {
        console.log(res);
        var ret = res;
        var coors = ret.result.routes[0].polyline, pl = [];
        //坐标解压（返回的点串坐标，通过前向差分进行压缩）
        var kr = 1000000;
        for (var i = 2; i < coors.length; i++) {
          coors[i] = Number(coors[i - 2]) + Number(coors[i]) / kr;
        }
        //将解压后的坐标放入点串数组pl中
        for (var i = 0; i < coors.length; i += 2) {
          pl.push({ latitude: coors[i], longitude: coors[i + 1] })
        }
        console.log(pl)
        //设置polyline属性，将路线显示出来,将解压坐标第一个数据作为起点
        _this.setData({
          latitude: pl[0].latitude,
          longitude: pl[0].longitude,
          polyline: [{
            points: pl,
            color: '#FF0000DD',
            width: 4
          }]
        })
      },
      fail: function (error) {
        wx.showToast({
          title: '当前无法规划路线',
          icon: 'none',
          duration: 2000
        })
      },
      complete: function (res) {
        console.log(res);
      }
    })
  }
})