// miniprogram/pages/cardList/cardList.js
const LIMIT = 10;//限制数据条数
Page({

   /**
    * 页面的初始数据
    */
   data: {
     type:0,
     page:0,
     list:[]
   },

   /**
    * 生命周期函数--监听页面加载
    */
   onLoad: function (options) {
     //1.获取要展示的类型
     this.setData({
       //将recognize中获取到的类型数据传入到type中
       type: options.type
     })

     //2.去数据库中查询数据
     this.queryDataFormDB()
   },

  queryDataFormDB: function () {
     //1.根据传过来的类型选择卡证类型，连接不同数据库
     const collectionName = this.data.type == 0 ? 'idcards' : 'bankcards';
     wx.cloud.database()
         .collection(collectionName)
         //2.采用数据分页，分页获取数据
         .skip(this.data.page * LIMIT).limit(LIMIT)
         .get()
         .then( res => {
           //3.获取成功后对页面进行加页
           this.setData({
             page: this.data.page + 1
           })

           //4.将最新的数据添加到原来数组中
           let odList = this.data.list ;//获取原来列表数据
           //通过对象结构将最新的数据一个一个取出添加新的数组中，实现在原数组中添加，用concat进行连接也可
           odList.push(...res.data);
           //获取最新数组后添加头list数组中
           this.setData({list: odList})
         })
  },

    //点击按钮设置
    copyClick: function (event) {
       //获取当前点击索引index
     
       const index = event.currentTarget.dataset.index;
   
        //调用云函数剪切版，实现复制功能
        wx.setClipboardData({
            //获取卡证中具体的信息
            data: this.data.list[index].id,
            success: () => {
                //成功进行提示
                wx.showToast( {
                    title: '信息复制成功'
                })
            }
        })
    },

    //删除按钮设置，连接数据库根据具体id进行准确删除
    deleteClick: function (event) {
       //获取当前信息具体索引值index
        const index = event.currentTarget.dataset.index;
        //拿到当前数据具体的id去删除数据库中对应ID的数据，删除完毕后更新数组展示
        const _id = this.data.list[index]._id;
        wx.cloud.database().collection("idcards")
            .doc(_id)
            .remove()//找到后进行删除
            .then( res => {
                //数据库删除后，也要将页面中显示的数组中存在的数据删除
                const oldList = this.data.list //获取当数组的值
          
                oldList.splice(index,1) //通过splice进行删除数组中的值
                this.setData({ list: oldList}) //将删除后的数组刷新界面，并提示消息
                wx.showToast( {
                    title: '删除信息成功',
                })
            })
    }

})