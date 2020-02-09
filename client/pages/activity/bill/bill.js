const { $Message } = require('../../../dist/base/index');
var util = require('../../../utils/util.js')
var app = getApp()
var cyto = require('../../../加密工具/cyto.js')
var sha1 = require('../../../加密工具/sha1.js')
var date = new Date()
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


Page({
  data: {
    header:'',
    billRecord: null,//公账
    billRecordPri:null,//私账
    visible: false,
    index:1,
    publicList:[],
    personalList:[],
    totalCount:'',
    totalCountOfMine:'',
    publicCountOfMine:'',
    personalCount:'',
    actions: [
      {
        name: '私账',
      },
      {
        name: '公账'
      }
    ]
  },
  handleOpen() {
    this.setData({
      visible: true
    });
  },
  handleClickItem({ detail }) {
    var type=''
    var index = detail.index
    if(index==1)
      type='公账'
    else
      type='私账'
    wx.setNavigationBarTitle({
      title: type
    })
    this.setData({
      visible: false,
      index:index
    })
  },
  onLoad: function (options) {
    util.check()
    var that = this
    that.setData({
      header:options.header
    })

    var token = date.format('yyyy-MM-dd') + cyto.Encrypt(wx.getStorageSync('acId')) + cyto.Encrypt(wx.getStorageSync('openid')) + date.format('yyyy-MM-dd')
    var hash = sha1.sha1(token)
    wx.request({
      url: 'https://www.wxxcx.chaoswang.cn/weapp/GetBill',
      data: {
        openid: cyto.Encrypt(wx.getStorageSync('openid')),
        acId: cyto.Encrypt(wx.getStorageSync('acId'))
      },
      method: 'POST',
      header: {
        'content-type': 'application/json',
        token: hash
      },
      success(res) {
        console.log(res.data)
        var totalCount = 0
        var totalCountOfMine = 0
        var publicCountOfMine = 0
        var personalCount = 0
        var publicList = res.data.publicList
        var personalList = res.data.personalList

        for (var i = 0; i < publicList.length; i++) {
          //publicList[i].billInfo = JSON.parse(publicList[i].billInfo)
          totalCount += Number(publicList[i].billInfo.billInfo.billMoney)
          for (var j = 0; j < publicList[i].billInfo.billInfo.participant.length; j++) {
            if (publicList[i].billInfo.billInfo.participant[j] == wx.getStorageSync('openid')) {
              totalCountOfMine += (Number(publicList[i].billInfo.billInfo.billMoney) / publicList[i].billInfo.billInfo.participant.length)
              break
            }
          }
          if (publicList[i].billInfo.billInfo.payer == wx.getStorageSync('openid')) {
            publicCountOfMine += Number(publicList[i].billInfo.billInfo.billMoney)
          }
        }

        for (var i = 0; i < personalList.length; i++) {
          //personalList[i].billInfo = JSON.parse(personalList[i].billInfo)
          personalCount += Number(personalList[i].billInfo.billInfo.billMoney)
        }

        that.setData({
          personalCount: personalCount,
          publicList: publicList,
          personalList: personalList,
          publicCountOfMine: publicCountOfMine,
          totalCount: totalCount,
          totalCountOfMine: totalCountOfMine
        })

      }
    })
  },

  onShow() {
    
  },

  onBillRecord() {
    wx.navigateTo({
      url:'./create/create'
    })
  },
  onBillAccount(){
    util.check()
    var that = this

    var token = date.format('yyyy-MM-dd') + cyto.Encrypt(wx.getStorageSync('acId')) + cyto.Encrypt(wx.getStorageSync('openid')) + date.format('yyyy-MM-dd')
    var hash = sha1.sha1(token)
    wx.request({
      url: 'https://www.wxxcx.chaoswang.cn/weapp/GetBill',
      data: {
        openid: cyto.Encrypt(wx.getStorageSync('openid')),
        acId: cyto.Encrypt(wx.getStorageSync('acId'))
      },
      method: 'POST',
      header: {
        'content-type': 'application/json',
        token: hash
      },
      success(res) {
        var totalCount = 0
        var totalCountOfMine = 0
        var publicCountOfMine = 0
        var personalCount = 0
        var publicList = res.data.publicList
        var personalList = res.data.personalList

        for (var i = 0; i < publicList.length; i++) {
          //publicList[i].billInfo = JSON.parse(publicList[i].billInfo)
          totalCount += Number(publicList[i].billInfo.billInfo.billMoney)
          for (var j = 0; j < publicList[i].billInfo.billInfo.participant.length; j++) {
            if (publicList[i].billInfo.billInfo.participant[j] == wx.getStorageSync('openid')) {
              totalCountOfMine += (Number(publicList[i].billInfo.billInfo.billMoney) / publicList[i].billInfo.billInfo.participant.length)
              break
            }
          }
          if (publicList[i].billInfo.billInfo.payer == wx.getStorageSync('openid')) {
            publicCountOfMine += Number(publicList[i].billInfo.billInfo.billMoney)
          }
        }

        for (var i = 0; i < personalList.length; i++) {
          //personalList[i].billInfo = JSON.parse(personalList[i].billInfo)
          personalCount += Number(personalList[i].billInfo.billInfo.billMoney)
        }

        that.setData({
          personalCount: personalCount,
          publicList: publicList,
          personalList: personalList,
          publicCountOfMine: publicCountOfMine,
          totalCount: totalCount,
          totalCountOfMine: totalCountOfMine
        })
        wx.showToast({
          title: '刷新成功！',
          icon: 'success',
          duration: 2000
        })
      }
    })
  }
})
