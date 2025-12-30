const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js"); 
const Listing = require("../models/listing");
const Review = require("../models/review");
const { isLoggedIn, isOwner, validateListing} = require("../middleware.js");
const { index } = require("../controllers/listing.js");
const listingController = require("../controllers/listing.js");
const multer  = require('multer')
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage })

 //Router.route

 router
    .route("/")
    .get(wrapAsync(listingController.index))
    .post( validateListing,upload.single("image"), wrapAsync(listingController.createListings)
);
    
// ✅ NEW route
router.get("/new", isLoggedIn, listingController.renderNewForm );

router
    .route("/:id")
    .get(wrapAsync(listingController.showRoutes))
    .put(isLoggedIn,isOwner,upload.single('image'), validateListing, wrapAsync(listingController.updateListing))
    .delete(isLoggedIn,isOwner, wrapAsync(listingController.deleteListing));


// ✅ EDIT route
router.get("/:id/edit",isLoggedIn,isOwner, wrapAsync(listingController.editForm));

module.exports = router;
 