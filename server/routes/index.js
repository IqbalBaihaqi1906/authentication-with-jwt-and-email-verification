const Router = require('express').Router()
const userRoute = require('./User')

Router.get('/',(req,res,next) => {
    res.status(200).json({
        message : "Server is ready"
    })
})

Router.use(userRoute)

module.exports = Router