// miniprogram/pages/home/home.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    categories: [
      { title: "身份证", icon: "/assets/zhengjian.png" },
      { title: "银行卡", icon: "/assets/yhk.png" }
    ],
 
  },
  pickValueChange: function (event) {
 
    //1获取选取中的类型
    const type = event.detail.value;
 
    //2.跳转到下一个界面,进行识别
    wx.navigateTo({
      url: `/pages/recognize/recognize?type=${type}`,
    })
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  

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


})