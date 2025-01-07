module.exports = ()=>{
    return (err,req,res,next)=>{
        console.log(err.message)
        //向客户端返回一个包含错误消息的 JSON 响应
        res.status(500).json({
            error:err.message
        })
    }
}