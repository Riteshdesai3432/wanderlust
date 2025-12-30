const express = require("express");
const router = express.Router();
const User = require("../models/user");
const wrapasync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");


const userContoller = require("../controllers/users.js");

// Router.route

router  
    .route("/signup")
    .get(userContoller.renderSignupForm)
    .post(wrapasync(userContoller.signup));


router
    .route("/login")
    .get(userContoller.renderLoginform)
    .post(saveRedirectUrl, passport.authenticate("local",{
    failureFlash: true,
    failureRedirect: "/login"
    }), userContoller.login
);

//logout

router.get("/logout", userContoller.logout);

module.exports = router;
