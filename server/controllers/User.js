const User = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const nodemailer = require('nodemailer')

// mail sender
const transporter = nodemailer.createTransport({
    service:'gmail',
    auth:{
        user : 'dlastproject01@gmail.com',
        pass : 'dlast123'
    },
    tls :{
        rejectUnauthorized: false
    }
})

const UserController = {
    getAll : async(req,res,next) => {
        try {
            const data = await User.find()

            res.status(200).json({
                data : data
            })
        } catch (error) {
            next({code:500, message:`Error at user controller getAll, ${error.message}`})
        }
    },
    Register : async(req,res,next) => {
        try {
            const {nama,email,password} = req.body
            const user = new User({
                nama,
                email,
                password:bcrypt.hashSync(password,8),
                emailToken:crypto.randomBytes(64).toString('hex'),
                isVerified:false,
                role:"user"
            });

            const newUser = await user.save()

            //send email verif

            const mailOptions = {
                from : '"Verify Your Email" <dlastproject01@gmail.com> ',
                to: newUser.email,
                subject : 'Dlast Project -verify your email',
                html: `<h2> Hello ${newUser.nama}! Thank you for registering on our site </h2>
                        <h4> Please verify your email to continue... </h4>
                        <a href="http://${req.headers.host}/users/verify-email?token=${newUser.emailToken}">Verify Your Email</a>
                `
            }

            //sending mail

            transporter.sendMail(mailOptions,function(error,info){
                if(error){
                    console.log(error + " di sending mail")
                }else {
                    console.log("Verification email is sent to your gmail account")
                }
            })

            res.status(200).json({
                data : newUser
            })

        } catch (error) {
            next({code:500, message:`Error at user controller Register, ${error.message}`})
        }
    },

    VerifyEmail : async(req,res,next) => {
        try {
            const token = req.query.token
            const user = await User.findOne({emailToken:token})
            if(user){
                user.emailToken = null
                user.isVerified = true
                await user.save()
                res.status(200).json({
                    message : `User is verified`,
                    data : user
                })
            }
        } catch (error) {
            next({code:500, message:`Error at user verifying email, ${error.message}`})
        }
    },

    Login : async(req,res,next) => {
        try {
            const {email,password} = req.body
            const findUser = await User.findOne({email})

            if(!findUser){
                return next({code:500, message:`Email / Password Invalid`})
            }

            const match = await bcrypt.compare(password,findUser.password)

            if(!match){
                return next({code:500, message:`Email / Password Invalid`})
            }

            const isVerif = await User.findOne({email:email,isVerified:true})

            if(!isVerif){
                return next({code:403, message:`Email is not verified, please check your email`})
            }

            const payload = {
                UserId: findUser._id,
                role: findUser.role,
                username: findUser.nama,
                email : findUser.email
            };

            const accesstoken = jwt.sign(payload, process.env.JWT_SECRET);
            res.status(200).json({
            message: "Login Sukses!",
            accesstoken: accesstoken,
            data: payload,
            });
            
            res.status(200).json({
                message : "Login Success",
                data : findUser,
                token : accesstoken
            })
        } catch (error) {
            next({code:500, message:`Error at user controller Login, ${error.message}`})
        }
    }
}

module.exports = UserController