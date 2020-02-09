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

  /**
   * 页面的初始数据
   */
  data: {
    uploaderList: [],
    uploaderNum: 0,
    showUpload: true,
    topic:'已上传(总计:0张)',
    topic2:'上传区(0/9)',
    imgUrl:[]
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
  showImg: function (e) {
    var that = this;
    wx.previewImage({
      urls: that.data.uploaderList,
      current: that.data.uploaderList[e.currentTarget.dataset.index]
    })
  },
  showImg1: function (e) {
    var that = this;
    wx.previewImage({
      urls: that.data.imgUrl,
      current: that.data.imgUrl[e.currentTarget.dataset.index]
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
          topic2: '上传区(' + uploaderList.length + '/9)'
        })

        for (var i = 0; i < that.data.uploaderList.length; i++) {
          var filePath = that.data.uploaderList[i]
          wx.uploadFile({
            url: 'https://www.wxxcx.chaoswang.cn/weapp/UploadAcImg',
            filePath: filePath,
            name: 'file',
            formData: {
              ac_id: wx.getStorageSync('acId'),
              open_id: wx.getStorageSync('openid')
            },
            success(res) {
              console.log(res)
            }
          })
          if (i == that.data.uploaderList.length - 1){
            $Toast({
              content: '上传成功，可再次添加上传',
              type: 'success'
            });
            that.setData({
              uploaderList:[],
              topic2: '上传区(0/9)',
              uploaderNum:0
            })
            break
          }

        }
      }
    })
    this.fresh()
  },
  fresh: function(){
    var that = this
    wx.request({
      url: 'https://www.wxxcx.chaoswang.cn/weapp/GetAcImg',
      data: {
        acId: wx.getStorageSync('acId'),
      },
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      success(res) {
        var urlList = []
        for (var i = 0; i < res.data.imgList.length; i++) {
          urlList[urlList.length] = res.data.imgList[i][0].acImgUrl
        }
        that.setData({
          imgUrl: urlList,
          topic: '已上传(总计:' + urlList.length + '张)'
        })
      }
    })
  },

  onLoad: function (options) {
    util.check()
    var that=this
    wx.request({
      url: 'https://www.wxxcx.chaoswang.cn/weapp/GetAcImg',
      data: {
        acId: wx.getStorageSync('acId'),
      },
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      success(res) {
        var urlList=[]
        for(var i=0;i<res.data.imgList.length;i++){
          urlList[urlList.length] = res.data.imgList[i][0].acImgUrl
        }
        that.setData({
          imgUrl:urlList,
          topic: '已上传(总计:' + urlList.length +'张)'
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
  kindToggle: function (e) {
    var id = e.currentTarget.id, list = this.data.list;
    for (var i = 0, len = list.length; i < len; ++i) {
      if (list[i].id == id) {
        list[i].open = !list[i].open
      } else {
        list[i].open = false
      }
    }
    this.setData({
      list: list
    });
  }
})