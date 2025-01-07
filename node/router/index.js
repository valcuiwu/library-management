const express = require('express')
const router = express.Router()

//挂载路由模块
router.use(require('./user'))
router.use(require('./admin'))

module.exports = router