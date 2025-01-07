const express = require('express')
const app = express()
const fs = require('fs')
const path = require('path')
const router = require('./router')
const errorHandler = require('./middleware/error-handler')

// 自定义跨域中间件
var allowCors = function (req, res, next) {
    //允许所有来源的跨域请求
    res.header('Access-Control-Allow-Origin', '*')
    //允许的 HTTP 请求方法
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
    //允许的请求头字段
    res.header('Access-Control-Allow-Headers', 'Content-Type,Access-Token,Appid,Secret,Authorization')
    //允许发送凭据（如 cookies）
    res.header('Access-Control-Allow-Credentials', 'true')
    next()
  }
  app.use(allowCors) //使用跨域中间件

// 配置启动端口
const PORT = process.env.PORT || 8833

// 允许接收json数据
app.use(express.json())

// 配置静态资源访问的根路径
app.use("./file",express.static("public"))
// 挂载路由，并限定前缀
app.use('/api',router)

app.use(errorHandler())

app.listen(PORT,()=> {
    console.log(`图书管理系统服务已经启动，端口在${PORT}`);
})