var date = new Date()
var currentHours = date.getHours()
var currentMinute = date.getMinutes();
var cyto = require('../加密工具/cyto.js')
var sha1 = require('../加密工具/sha1.js')
const { $Toast } = require('../dist/base/index');
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

const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function check(){
  var check_Storage1 = wx.getStorageInfoSync().keys.toString()
  if (check_Storage1.indexOf('openid') == -1) {
    wx.setStorageSync('logged', false)
  } else{
    var openid = cyto.Encrypt(wx.getStorageSync('openid'))
    var token = date.format('yyyy-MM-dd') + openid + date.format('yyyy-MM-dd')
    var hash = sha1.sha1(token)
    wx.request({
      url: 'https://www.wxxcx.chaoswang.cn/weapp/BoolBusy',
      data: {
        openid: openid
      },
      method: 'POST',
      header: {
        'content-type': 'application/json',
        token: hash
      },
      success(res) {
        if(res.data.tag==false){
          wx.setStorageSync('bool_ing', false)
          wx.setStorageSync('acId', null)
          wx.setStorageSync('boolCreator', res.data.boolCreator)
        }else{
          wx.setStorageSync('bool_ing', true)
          wx.setStorageSync('acId', res.data.ac_id)
          wx.setStorageSync('boolCreator', res.data.boolCreator)
        }
      }
    })
    wx.setStorageSync('logged',true)
  }
  if(!wx.getStorageSync('logged')){
    wx.showToast({
      title: '您没有登陆',
      icon: 'none',
      duration: 2000
    })
    setTimeout(function () {
      wx.switchTab({
        url: '../my/my',
      })
    }, 2000)
  }
}


module.exports = {
  formatTime: formatTime,
  check:check
}