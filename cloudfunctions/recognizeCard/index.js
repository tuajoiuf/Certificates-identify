// 云函数入口文件
const cloud = require('wx-server-sdk')
//引入图片识别SDK
const { ImageClient } = require('image-node-sdk');
cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
   //1.取出小程序端传入的fileURL/type
   const fileURL = event.fileURL;
   const type = event.type;

   //2.使用腾讯云AI功能进行识别（身份证验证）

   let AppId = '1300940164'; // 腾讯云 AppId
   let SecretId = 'AKID97qKXVDUVFivuc3D6h16vTkjSv72i9JC'; // 腾讯云 SecretId
   let SecretKey = 'e17wUnqb5JHyPbXCahX6OPAgvsZMt97q'; // 腾讯云 SecretKey

   //识别图片地址
   let idCardImageUrl= fileURL;
   let imgClient = new ImageClient({ AppId, SecretId, SecretKey });
   //使用异步函数处理，将得到的结果返回到小程序那边
   const result = await imgClient.ocrIdCard({
      data: {
         url_list: [idCardImageUrl]
      }
   })
   return JSON.parse(result.body).result_list[0].data;
}