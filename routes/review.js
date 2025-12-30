const express = require("express");
const router = express.Router({ mergeParams: true }); // ✅ mergeParams needed to access :id from parent route
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");
const Listing = require("../models/listing");
const Review = require("../models/review");
const {validateReview, isLoggedIn, isReviewAuthor} = require("../middleware.js")

const reviewContoller = require("../controllers/review.js")

// ✅ CREATE Review route
router.post("/",isLoggedIn, validateReview, wrapAsync(reviewContoller.createReview));

// ✅ DELETE Review route
router.delete("/:reviewId",isLoggedIn,isReviewAuthor, wrapAsync(reviewContoller.deleteReview));

module.exports = router;
