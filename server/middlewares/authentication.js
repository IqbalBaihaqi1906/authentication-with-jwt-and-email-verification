const jwt = require('jsonwebtoken')
const User = require('../models/User')


const authentication = async (req,res,next) => {
    try {
        // get token dari header masing2 route
        const { accesstoken } = req.headers;
        // console.log(req.headers)

        if (!accesstoken) {
        return next({ code: 404, message: "accesstoken needed" });
        }

        const jwtPayload = jwt.verify(accesstoken, process.env.JWT_SECRET);

        let user = await User.findOne({ _id: jwtPayload.UserId });

        if (!user) {
        return next({ code: 404, message: "User sudah tidak ada di database" });
        }

        req.currentUser = user;

        // res.json(user)

        next();

    } catch (error) {
        next({code:500, message:`Error at authentication, ${error.message}`})
    }
}

module.exports = authentication