const router = require('express').Router()
const userController = require('../controllers/User')
const authentication = require('../middlewares/authentication')

router.get('/users',authentication,userController.getAll)
router.post('/users/register',userController.Register)
router.post('/users/login',userController.Login)
router.get('/users/verify-email',userController.VerifyEmail)

module.exports = router