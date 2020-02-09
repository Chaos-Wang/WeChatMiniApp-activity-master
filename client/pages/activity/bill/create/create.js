var util = require('../../../../utils/util.js')

// pages/bill/create/create.js
var date = new Date()
var currentHours = date.getHours()
var currentMinute = date.getMinutes();
var cyto = require('../../../../加密工具/cyto.js')
var sha1 = require('../../../../加密工具/sha1.js')
const { $Toast } = require('../../../../dist/base/index')

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
    billMoney: '',
    billDate: '',
    billDetail: '',
    billPublic: false,
    billType:'饮食',
    participant: '',
    payer: '',
    array: ['住宿', '交通', '饮食', '门票', '购物', '娱乐', '其他'],
    index: 2,
    objectArray: [
      {
        id: 0,
        name: '住宿'
      },
      {
        id: 1,
        name: '交通'
      },
      {
        id: 2,
        name: '饮食'
      },
      {
        id: 3,
        name: '门票'
      },
      {
        id: 4,
        name: '购物'
      },
      {
        id: 5,
        name: '娱乐'
      },
      {
        id: 6,
        name: '其他'
      }
    ],
  },
  onShow(options){
    console.log(options)
  },
  bindInputChange1(e) {
    this.setData({
      billMoney: e.detail.detail.value
    })
  },
  bindInputChange2(e) {
    console.log(e.detail)
    this.setData({
      billDetail: e.detail.detail.value
    })
  },
  bindDateChange(e) {
    this.setData({
      billDate: e.detail.value
    })
  },
  bindPickerChange(e) {
    this.setData({
      index: e.detail.value,
      billType: this.data.objectArray[e.detail.value].name
    })
  },
  onChange: function () {
    var _this = this
    this.setData({
      billPublic: !_this.data.billPublic
    })
  },
  onShow: function () {
    util.check()
    var _this = this
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    if (month < 10) {
      month = "0" + month;
    }
    if (day < 10) {
      day = "0" + day;
    }
    var nowDate = year + "-" + month + "-" + day;
    this.setData({
      billDate: nowDate

    })
  },
  naviToParticipant: function(){
    var list=[]
    for(var i=0;i<this.data.participant.length;i++){
      list[list.length] = this.data.participant[i].name
    }
    wx.navigateTo({
      url: '../participant/participant?participant='+list,
    })
  },
  naviToPayer: function () {
    var that=this
    wx.navigateTo({
      url: '../payer/payer?payer='+that.data.payer.name,
    })
  },

  submit: function () {
    if (this.data.billMoney != '') {
      if(this.data.billPublic){
        var list = []
        for (var i = 0; i < this.data.participant.length; i++) {
          list[list.length] = this.data.participant[i].openid
        }
        var billJson = {
          billDetail:this.data.billDetail,
          billMoney: this.data.billMoney,
          billDate: this.data.billDate,
          billType: this.data.billType,
          payer:this.data.payer.openid,
          participant:list
        }
      }else{
        var billJson = {
          billDetail: this.data.billDetail,
          billMoney: this.data.billMoney,
          billDate: this.data.billDate,
          billType: this.data.billType,
          payer: wx.getStorageSync('openid')
        }
      }

      var billInfo = cyto.Encrypt(JSON.stringify(billJson))
      var acId=cyto.Encrypt(wx.getStorageSync('acId'))
      var openid = cyto.Encrypt(wx.getStorageSync('openid'))

      var token = date.format('yyyy-MM-dd') + acId + cyto.Encrypt(JSON.stringify(billJson)) + openid + date.format('yyyy-MM-dd')
      var hash = sha1.sha1(token)

      wx.request({
        url: 'https://www.wxxcx.chaoswang.cn/weapp/CreateBill',
        data: {
          billInfo: billInfo,
          acId: acId,
          openid:openid,
          billType:this.data.billPublic
        },
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded',
          token: hash
        },
        success(res) {
          if (res.data.code = 200){
            $Toast({
              content: '创建成功',
              type: 'success'
            });
            wx.navigateBack()
          }else
            $Toast({
              content: '出现错误，请联系开发者',
              type: 'error'
            });
        }
      })
    }
    else {
      $Toast({
        content: '请输入金额',
        type: 'warning'
      });
    }
  }

})