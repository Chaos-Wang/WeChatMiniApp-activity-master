Page({

  data: {
    InfoList: [],
    Info: "",
    input: ""
  },
  save: function () {
    wx.setStorageSync('Info', this.data.InfoList);
  },

  loadData: function () {
    if (temp) {
      this.setData({
        InfoList: temp
      });
    }
  },
  AddInput:function(e){
    console.log(e)
    this.setData({
      input: e.detail.value
    })
  },
  AddConfirm: function (e) {
    var that = this;
    var  temp = this.data.InfoList;
    temp.push({ description: this.data.input, completed: false })

    that.setData({ InfoList: temp, input: '' });

    console.log(this.data.InfoList)

    this.save();
  },

  remove: function (e) {
    var temp = this.data.InfoList;
    var index = e.currentTarget.id;
    //删除数据
    temp.splice(index, 1);
    console.log(temp);
    //设置数据
    this.setData({
      InfoList: temp
    });
    this.save();
  },

  onLoad: function (options) {
    wx.showToast({
      title: '这些数据仅短期存储在本地缓存',
      icon: 'none',
      duration: 1000,
    })
  }
})