const {
    verify
} = require('../util/jwt')
const {
    jwtSecret
} = require('../config/config.default')
const db = require('../database/index')

module.exports = async (req, res, next) => {
    try {
    // 从请求头中获取token数据
    let token = req.headers['authorization']
    //如果 token 存在
    token = token ?
        token.split('Bearer ')[1] :
        //否则
        null
    if (!token) {
        return res.status(401).end()
    }
    // 验证token是否有效
        const decodedToken = await verify(token, jwtSecret)
        let sql = `
        SELECT * FROM user WHERE
        id = ${db.escape(decodedToken.userId)}
        `
        await db.startQuery(sql).then((ret) => {
            ret = ret[0]
            //从查询结果中删除用户的密码信息，以保护用户隐私
            delete ret.password
            //将用户信息附加到请求对象上，以便后续的路由处理函数可以访问
            req.user = ret
        })
        next()
    } catch (err) {
        return res.status(401).end('未登录')
    }
}