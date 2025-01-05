// // const nodemailer = require('nodemailer')

let authUser = '2973712698@qq.com'
let authPass = 'woymbvdjmcoedfef'

// // let transporter = nodemailer.createTransport({
// //     host:'smtp.qq.com',
// //     secureConnection:true,
// //     port:465,
// //     secure:true,
// //     auth:{
// //         user: authUser,
// //         pass: authPass
// //     }
// // })

// const nodemailer = require('nodemailer');

// // 创建一个 SMTP 客户端配置
// const transporter = nodemailer.createTransport({
//   host: 'smtp.qq.com', // 邮箱服务器地址
//   port: 465, // 端口号
//   secure: true, // 使用 SSL
//   auth: {
//     user: '2973712698@qq.com', // 邮箱地址
//     pass: 'woymbvdjmcoedfef' // 邮箱授权码
//   }
// });

// // 发送邮件的函数
// const sendEmail = (to, subject, text) => {
//   const mailOptions = {
//     from: '2973712698@qq.com', // 发件人地址
//     to: to, // 收件人地址
//     subject: subject, // 邮件主题
//     text: text // 邮件内容
//   };

//   transporter.sendMail(mailOptions, (error, info) => {
//     if (error) {
//       return console.log(error);
//     }
//     console.log('Email sent: ' + info.response);
//   });
// };

// module.exports = sendEmail; // 导出函数，以便在其他地方使用

// async function sendMail(address,title,content){
//     try{
//         let mailOption = {
//             from: authUser,
//             to:`${address}`,
//             subject:`${title}`,
//             text:`${content}`
//         }
//         transporter.sendMail(mailOption,(err,info)=>{
//             if(err) {
//                 console.log(err)
//             } else{
//                 console.log('邮件发送:'+ info.response)
//             }
//         })
//     } catch(err) {
//         next(err)
//     }
// }

// // module.exports = sendMail;


const nodemailer = require('nodemailer');

// 创建一个 SMTP 客户端配置
const transporter = nodemailer.createTransport({
  host: 'smtp.qq.com', // 邮箱服务器地址
  port: 465, // 端口号
  secure: true, // 使用 SSL
  auth: {
    user: '2973712698@qq.com', // 邮箱地址
    pass: 'woymbvdjmcoedfef' // 邮箱授权码
  }
});

// 合并后的发送邮件的异步函数
const sendEmail = async (to, subject, text) => {
  const mailOptions = {
    from: '2973712698@qq.com', // 发件人地址
    to: to, // 收件人地址
    subject: subject, // 邮件主题
    text: text // 邮件内容
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

module.exports = sendEmail; // 导出函数，以便在其他地方使用