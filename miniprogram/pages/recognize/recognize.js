// miniprogram/pages/recognize/recognize.js
const idCollection = wx.cloud.database().collection('idcards');
Page({

   /**
    * 页面的初始数据
    */
   data: {
      type: 0,
      categories:["身份证","银行卡"],
      idInfo: null ,//显示身份证信息
      bankInfo: null
   },
   onLoad: function (options) {
      this.setData({
      type: options.type
      })
   },

   // 选择名片,并识别身份信息

   selectClick: function () {
      //1.让用户拍照或者选择相册
      wx.chooseImage( {
         success:  res => {
            //1.1获取到选择图片,多张可以通过遍历
            const filePath = res.tempFilePaths[0];

            //1.2提示选择类型
            wx.showLoading({
               title:this.data.categories[this.data.type]+ '识别中'
            })

            //2.将照片上传到云存储中,用函数展示,避免回调地狱
            this.uploadFileToCloud(filePath) 
         }
       }
      )},

      uploadFileToCloud: function (filePath) {
         //1.设置时间戳避开照片重复
         const timestamp = new Date().getTime();
         //2.调用云函数,将照片的路径传入到云存储中
         wx.cloud.uploadFile( {
            filePath,//上传的资源路径
            cloudPath:`images/openid_${timestamp}.jpg`//要存储的位置
      }).then( res => {
         //3.1获取云存储的fileID
         const fileID = res.fileID;

         //3.2根据fileID换取临时的URL
         this.getTempUERL(fileID);
      }) 
   },

   //根据fileID获取存储中的tempURL
   getTempUERL: function (fileID) {
      wx.cloud.getTempFileURL({
         fileList: [fileID] //将fileID存储到fileList中
      }).then( res => {
         //获取到临时存储URL
         const  fileURL = res.fileList[0].tempFileURL;

         //4.调用云函数,识别云存储中的fileID,将其转化为tempID浏览器能够响应
         this.recognizeImageURL(fileURL,fileID)
          })
   },

   //识别图片信息
   recognizeImageURL: function (fileURL,fileID) {
      //服务器地址:发送网络请求(将对应得域名在小程序后台配置)
      //可通过npm在小程序配置但因为配置过程中会有大量依赖,不利于优化
      //通过调用云函数,将请求发送到腾讯云识别处理,处理好后再将结果返回到云函数中
      wx.cloud.callFunction({
         name: "recognizeCard", //设置云开发文件
         //1.存储位置
         data: {
           fileURL,
            //获取当前点击类型是身份证还是银行卡
           type: this.data.type 
         }
      }).then ( res => {
          console.log(res )
     //2.判断是身份证还是银行卡利用3木运算符分别调用
         this.data.type == 0 ? this.handleIDInfo(res,fileID) : this. handleBankInfo(res)
      //3.设置完后，加载成功后，隐藏提示
         wx.hideLoading()
      })
   },
   //如果选择的是身份证
   handleIDInfo: function (res,fileID) {
      if (!res.result.id) {
         //将识别不到身份证号码失败的照片删除
         this.deletePhoto(fileID)
         wx.showToast({
            title:'卡证识别失败',
            //给云函数传入一个type，判断是银行卡还是身份证
            type: this.data.type
         })
         return
      }

      //5.获取腾讯云那边识别身份证成功传来的信息
      const result = res.result;
      const idInfo = {
         id: result.id,
         address: result.address,
         birth: result.birth,
         name: result.name,
         nation: result.nation,
         sex: result.sex,
         fileID: fileID
      }

      //6.展示信息
      this.setData({ idInfo   })
   },

   //如果选择的是银行卡
   handleBankInfo: function(res) {
      console.log(res)
   },
   // =================== 保存信息 ====================
   saveClick: function () {
      //保存信息进行展示
      wx.showLoading({
         title: "保存信息中"
      });

      //查询是否保存过这个身份信息
      idCollection.where({
         //根据id获取身份唯一标识
         id: this.data.idInfo.id
      }).get().then( res => {
         //判断身份信息是否已经存在,如果已经存在则进行覆盖
         if ( res.data.length > 0) {
            //获取到身份唯一标识id
            const _id = res.data[0]._id;
            const  fileID = res.data[0].fileID
            //函数通过出入的_id，进行覆盖方法处理
            this.coverInfo(_id)
            //通过fileID删除，重复信息
            this.deletePhoto(fileID)
         }else {
           //如何没有存在则直接进行保存
           this.saveInfo()
         }
      })
      //1.连接云存储，身份证识别获取成功后将身份信息添加到指定云存储文件位置
   //     idCollection.add({
   //       //将识别成功后的信息添加到存储中
   //       data: this.data.idInfo
   //    }).then( res => {
   //       //存储成功后进行提示
   //       wx.showToast({
   //         title: "信息保存成功",
   //       })
   //    })
   },
   //覆盖身份信息
   coverInfo: function (_id) {
      //连接数据库，根据_id，进行覆盖
      idCollection.doc(_id).set({
         data: this.data.idInfo
      }).then( //提示保存信息成功
          this.showSuccess)},

   //根据传入的fileID删除重复照片
   deletePhoto: function(fileID) {
      wx.cloud.deleteFile({
         //根据id删除照片
         fileList: [fileID]
      })
   },

   //保存身份信息
   saveInfo: function () {
      idCollection.add({
         //将身份信息保存到云存储中
         data:this.data.idInfo
      })
         .then(this.showSuccess)//成功展示显示
         .catch(this.showFail)//失败展示
   },

   showSuccess: function () {
      wx.showToast({
         title:"信息保存成功"
      })
   },
   showFail: function () {
      wx.showToast({
         title:"信息保存失败",
      })
   },
// =================== 复制信息 ====================
   copyClick: function () {
      //调用剪切达到复制效果
      wx.setClipboardData({
         //将当前要复制的数据传入到data中
         data:`${this.data.idInfo.id}`//复制身份证
      })
   }
   
})