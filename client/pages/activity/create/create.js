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

Page({
  data: {
    initDate: '',
    acNum:'',
    acName: '',
    acAddress: '点击选择',
    acPublic: false,
    startDate:'点击选择',
    startTime: '00:00',
    deadlineDate:'点击选择',
    deadlineTime: '00:00',
    acDetailInfo: 'unknown',
    switch1: false,
    acDetail:'',

    creatorName:'',
    creatorTele: '',
    creatorWeChat:'',
    uploaderList: [],
    uploaderNum: 0,
    showUpload: true
  },
  clearImg: function (e) {
    var nowList = [];//新数据
    var uploaderList = this.data.uploaderList;//原数据

    for (let i = 0; i < uploaderList.length; i++) {
      if (i == e.currentTarget.dataset.index) {
        continue;
      } else {
        nowList.push(uploaderList[i])
      }
    }
    this.setData({
      uploaderNum: this.data.uploaderNum - 1,
      uploaderList: nowList,
      showUpload: true
    })
  },
  bindTimeChange1(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      startTime: e.detail.value
    })
  },
  bindTimeChange2(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      deadlineTime: e.detail.value
    })
  },
  //展示图片
  showImg: function (e) {
    var that = this;
    wx.previewImage({
      urls: that.data.uploaderList,
      current: that.data.uploaderList[e.currentTarget.dataset.index]
    })
  },
  //上传图片
  upload: function (e) {
    var that = this;
    wx.chooseImage({
      count: 9 - that.data.uploaderNum, 
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'], 
      success: function (res) {
        let tempFilePaths = res.tempFilePaths;
        let uploaderList = that.data.uploaderList.concat(tempFilePaths);
        if (uploaderList.length == 9) {
          that.setData({
            showUpload: false
          })
        }
        that.setData({
          uploaderList: uploaderList,
          uploaderNum: uploaderList.length,
        })
      }
    })
  },

  bindInputChange1(e) {
    this.setData({
      creatorName: e.detail.detail.value
    })
  },
  bindInputChange2(e) {
    this.setData({
      creatorTele: e.detail.detail.value
    })
  },
  bindInputChange3(e) {
    this.setData({
      creatorWeChat: e.detail.detail.value
    })
  },
  bindInputChange4(e) {
    this.setData({
      acName: e.detail.detail.value
    })
  },
  bindInputChange5(e) {
    this.setData({
      acNum: e.detail.detail.value
    })
  },
  bindInputChange6(e) {
    this.setData({
      acDetailInfo: e.detail.detail.value
    })
  },
  bindDateChange1(e) {
    e.detail.value = e.detail.value.replace(/-/g, '/')
    this.setData({
      startDate: e.detail.value
    })
  },
  bindDateChange2(e) {
    e.detail.value = e.detail.value.replace(/-/g, '/')
    this.setData({
      deadlineDate: e.detail.value
    })
  },
  getLocation: function(){
    var that=this
    wx.chooseLocation({
      success: function (res) {
        console.log(res)
        that.setData({
          acAddress:res
        })
      }
    })
  },
  onChange1:function(){
    var _this=this
    this.setData({
      acPublic:!_this.data.acPublic
    })
  },
  onChange2: function (event) {
    const detail = event.detail;
    this.setData({
      'switch1': detail.value
    })
  },
  onLoad:function(){
    util.check()
    this.setData({
      initDate: date.format("yyyy-MM-dd")
    })

  },
  submit:function(){
    var that = this
    if (that.data.uploaderList.length<1){
      wx.showToast({
        title: '请上传至少一张图片作为活动封面',
        icon: 'none',
        duration: 2000
      })
    }else{
    if (this.data.creatorTele != '' && this.data.acName != '' && this.data.startDate != '点击选择' && this.data.deadlineDate!='点击选择'&&this.data.acNum-1>0&&this.data.acAddress!='点击选择') {
      var acJson={
        acNum:this.data.acNum-1,
        acName:this.data.acName,
        acDetail:this.data.acDetail,
        acPublic:this.data.acPublic,
        startTime: this.data.startDate + ' ' + this.data.startTime,
        deadlineTime:this.data.deadlineDate + ' '+ this.data.deadlineTime,
        acDetailInfo:this.data.acDetailInfo
      }
      var creatorJson={
          creatorName:this.data.creatorName,
          creatorTele:this.data.creatorTele,
          creatorWeChat:this.data.creatorWeChat
      }
      var acInfo=cyto.Encrypt(JSON.stringify(acJson))
      var creatorInfo = cyto.Encrypt(JSON.stringify(creatorJson))

      var token = date.format('yyyy-MM-dd') + acInfo + JSON.stringify(that.data.acAddress) + wx.getStorageSync('openid') + creatorInfo + '#' + wx.getStorageSync('openid') + date.format('yyyy-MM-dd')
      var hash = sha1.sha1(token)

      wx.request({
        url: 'https://www.wxxcx.chaoswang.cn/weapp/CreateAc',
        data: {
          acInfo: acInfo,
          creatorInfo: creatorInfo,
          creatorId: wx.getStorageSync('openid'),
          memberList: '#' + wx.getStorageSync('openid'),
          acLocation: JSON.stringify(that.data.acAddress)
        },
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded',
          token: hash
        },
        success(res) {
          if (res.data.code != 200) {
            $Toast({
              content: '创建失败，请检查表单信息',
              type: 'error'
            });
          }
          if (that.data.uploaderList.length==0){
            $Toast({
              content: '创建成功',
              type: 'success'
            });
            setTimeout(function () {
                  util.check()
                  wx.switchTab({
                    url: '../activity',
                }) 
            }, 2000);
          }
          var ac_id=res.data.acId[0]
          for (var i = 0; i < that.data.uploaderList.length; i++) {
            var filePath = that.data.uploaderList[i]
            wx.uploadFile({
              url: 'https://www.wxxcx.chaoswang.cn/weapp/UploadAcImg',
              filePath: filePath,
              name: 'file',
              formData: {
                ac_id: ac_id,
                open_id: wx.getStorageSync('openid')
              },
              success(res) {
                console.log(res)
              }
            })   
            if(i==that.data.uploaderList.length-1){
              $Toast({
                content: '创建成功',
                type: 'success'
              });
              setTimeout(function () {
                    util.check()
                    wx.switchTab({
                      url: '../activity',
                    }) 
              }, 2000);
            }         
          }
        }
      })
    }
    else{
      $Toast({
        content: '请确定必填项是否填写完整',
        type: 'warning'
      });
    }

    }
  }
});