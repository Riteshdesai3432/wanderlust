if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();

const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const ExpressError = require("./utils/ExpressError");
const Listing = require("./models/listing");
const User = require("./models/user");

const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const flash = require("connect-flash");

const passport = require("passport");
const LocalStrategy = require("passport-local");

app.use(methodOverride("_method"));


// required middleware
const {isLoggedIn} = require("./middleware.js");

// ✅ Require your data from init/data.js
const { data } = require("./init/data");
const { error } = require("console");

const listingRouter = require("./routes/listing");
const reviewRouter = require("./routes/review");
const userRouter = require("./routes/user");

// let MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

const dbUrl = process.env.ATLASDB_URL;

main().then(async () => {
  console.log("Connected to DB");

  // await initDB(); // ✅ SEED DATABASE
}).catch(err => {
  console.log(err);
});


async function main() {
  await mongoose.connect(dbUrl);
}

// ✅ Function to seed the database
async function initDB() {
  try {
    await Listing.deleteMany({}); // clear old listings
    await Listing.insertMany(data); // insert new listings
    console.log("✅ Database seeded!");
  } catch (e) {
    console.log("Error seeding DB:", e);
  }
}

// Express & EJS setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static("public"));

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600
});

store.on("error", (err) => {
  console.log("Error in Mongo Session Store:", err);
});

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false
};


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;      // ADD THIS
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

app.use("/", userRouter);

//validate review

const validateReview = (req, res, next) => {
let { error } = reviewSchema.validate(req.body);
if(error){
  let msg = error.details.map((el) => el.message).join(",");
  throw new ExpressError(400, msg);
} else {
  next();
} 
};
// app.use("/listing", require("./routes/listing"));
// app.use("/listing/:id/reviews", require("./routes/review"));

app.use("/listing", listingRouter);                 
app.use("/listing/:id/reviews", reviewRouter);    

// 404 handler
app.use((req, res, next) => { 
  next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong.." } = err;
  
  res.status(statusCode).render("error.ejs", { message }); // Pass the err object
});

// Start server
app.listen(8080, () => {
  console.log("Listening to PORT 8080");
}); 