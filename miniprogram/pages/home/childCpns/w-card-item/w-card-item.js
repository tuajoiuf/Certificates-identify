// pages/home/w-card-item/w-card-item.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    categories: {
      type: Array,
      value: []
    }

  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    itemClick: function (event) {
      //获取点击index
      const index = event.currentTarget.dataset.index;

      //当点击身份证或银行卡，根据索引index进行页面跳转
      wx.navigateTo({
        url: '/pages/cardList/cardList?type=' + index,
      })
    }

  }
})
