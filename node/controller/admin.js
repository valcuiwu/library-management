const fs = require('fs')
let request = require('request')
const path = require('path')
const jwt = require('../util/jwt')
const {
    promisify
} = require('util')
const {
    jwtSecret
} = require('../config/config.default')
request = promisify(request)
const {
    nanoid
} = require('nanoid')
const db = require('../database/index')
const mailer = require('../middleware/mail')

// 管理员注册
exports.adminRegister = async (req, res, next) => {
    try {
        let id = 'admin_' + req.body.name
        let sql = `INSERT INTO user 
        (id,name,password,mail_num,stu_id) VALUES
        (
            ${db.escape(id)},
            ${db.escape(req.body.name)},
            MD5(${db.escape(req.body.password)}),
            ${db.escape(id)},
            'admin'
        )
        `
        await db.startQuery(sql)
        res.status(200).send(`注册成功，您的账号为:${id}`)
    } catch (err) {
        next(err)
    }
}

// 管理员页面验证拦截(验证管理员登录状态)
exports.adminValidate = async (req, res, next) => {
    try {
        // 从请求头中获取token数据
        let token = req.headers['authorization']
        token = token ?
            token.split('Bearer ')[1] :
            null
        //验证JWT令牌有效性，并检查令牌中是否包含管理员ID
        if (!token) {
            return res.status(401).end()
        }
        const decodedToken = await jwt.verify(token, jwtSecret)
        if (decodedToken.userId.substring(0, 5) === 'admin') {
            res.status(200).send('ok')
        } else {
            res.status(400).send('no!')
        }
    } catch (err) {
        next(err)
    }
}

// 管理员获取借阅请求列表
exports.adminGetBorrowList = async (req, res, next) => {
    try {
        let sql = `SELECT * FROM book WHERE state LIKE 'wait_check_%'`
        let ret
        //变量 ret 用于存储查询结果
        await db.startQuery(sql).then(res => {
            ret = res
        })
        //响应客户端
        res.status(200).json({
            bookList: ret
        })
    } catch (err) {
        next(err)
    }
}

// 管理员同意借阅请求 ( 事务 )
exports.adminAgreeBorrow = async (req, res, next) => {
    try {
        //将 req.body.id 的值进行转义处理，防止 SQL 注入
        let sql = `SELECT hasBook FROM user WHERE id = ${db.escape(req.body.id)}`
        let ret
        await db.startQuery(sql).then(res => {
            ret = res[0].hasBook
        })
        ret += `&${req.body.book_id}`
        let current = new Date()
        let due = current.setDate(current.getDate() + 120)
        //YYYY-MM-DD 格式
        due = new Date(parseInt(due)).toLocaleString().substring(0, 9)
        let state = db.escape('occupied_' + req.body.id)
        let sql1 = `UPDATE book SET state = ${state},due = '${due}'
        WHERE book_id = ${db.escape(req.body.book_id)}`
        let sql2 = `UPDATE user SET hasBook = ${db.escape(ret)} 
        WHERE id = ${db.escape(req.body.id)}`
        db.pool.getConnection(async function (err, connection) {
            connection.beginTransaction(function (err) {
                if (err) {
                    next(err)
                }
                //开始一个数据库事务，确保以下操作要么全部成功，要么全部失败，确保一致性
                connection.query(sql1, function (error, results, fields) {
                    if (error) {
                        return connection.rollback(function () {
                            next(error)
                        })
                    }
                    connection.query(sql2, function (error, results, fields) {
                        if (error) {
                            return connection.rollback(function () {
                                next(error)
                            })
                        }
                        connection.commit(function (err) {
                            if (err) {
                                return connection.rollback(function () {
                                    next(err)
                                })
                            }
                        })
                    })
                })
                connection.release()
            })
        })
        res.status(200).send('ok')
    } catch (err) {
        next(err)
    }
}

// 管理员添加书本
exports.adminAddBook = async (req, res, next) => {
    try {
        //获取 book 表中书籍的总数
        let preSql = 'SELECT COUNT(*) AS COUNT FROM book'
        let book_id
        await db.startQuery(preSql).then(res => {
            book_id = res[0].COUNT+1
        })
        let sql = `INSERT INTO book (book_id,book_name,author,statement,state,due)
        VALUES (
            '${book_id}',
            ${db.escape(req.body.book_name)},
            ${db.escape(req.body.author)},
            ${db.escape(req.body.statement)},
            'available',
            '')
        `
        await db.startQuery(sql)
        res.status(200).send('ok')
    } catch (err) {
        next(err)
    }
}

// 管理员查看书本状态
exports.adminGetBooks = async (req, res, next) => {
    try {
        let query = req.query.book_name
        //存储处理后的查询字符串片段
        let query_arr = []
        //存储当前处理的字符片段
        let loopVar
        for (let i = 0; i < query.length; i++) {
            //将每个字符后面加上 %，形成一个模糊匹配的片段
            loopVar = query[i] + '%'
            query_arr.push(loopVar)
        }
        query = '%' + query_arr.join('')
        let sql = `SELECT * FROM book WHERE book_name LIKE ${db.escape(query)} LIMIT 10`
        let ret
        await db.startQuery(sql).then(res => {
            ret = res
        })
        res.status(200).json({
            bookList: ret
        })
    } catch (err) {
        next(err)
    }
}

// 管理员查询用户
exports.adminGetUsers = async (req,res,next) => {
    try {
        let sql = `SELECT * FROM user WHERE stu_id = ${db.escape(req.query.stu_id)}`
        let ret
        await db.startQuery(sql).then(res=>{
            ret = res
        })
        res.status(200).json({
            user:ret
        })
    } catch (err) {
        next(err)
    }
}

// 管理员重置用户密码 (重置为000000)
exports.resetPassword = async (req,res,next) => {
    try {
        let sql = `UPDATE user SET password = '670b14728ad9902aecba32e22fa4f6bd' WHERE id = ${db.escape(req.body.id)}`
        await db.startQuery(sql)
        res.status(200).send('ok')
    } catch(err) {
        next(err)
    }
}