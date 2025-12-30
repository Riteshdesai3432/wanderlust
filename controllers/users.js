const User =require("../models/user")

module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup");  
}

module.exports.renderLoginform = (req , res)=>{
    res.render("users/login");
}

module.exports.signup = async (req, res) => {
    try{
    const { username, email, password } = req.body;
    const newUser = new User({ username, email });
    const registeredUser = await User.register(newUser, password); // ✅ used
    console.log(registeredUser);
    await req.login(registeredUser,(err)=>{
        if(err) 
        return next(err);
         req.flash("success", "Welcome to Wanderlust!"); // ✔ correct
         res.redirect("/listing");
    }); // ✅ used

    }catch(e){
        req.flash("error", e.message);
        res.redirect("/signup");
    }
}

module.exports.login = async (req, res) => {
        req.flash("success", "Welcome back to Wanderlust!");
        const redirectUrl = res.locals.redirectUrl || "/listing";
        delete req.session.redirectUrl; // cleanup
        res.redirect(redirectUrl);
    }

    module.exports.logout = (req, res) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "Logged you out!");
        res.redirect("/listing");
    });
}