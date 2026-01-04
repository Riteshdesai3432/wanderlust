const express = require("express");
const router = express.Router();

// utils
const wrapAsync = require("../utils/wrapAsync.js");

// models
const Listing = require("../models/listing");

// controllers
const listingController = require("../controllers/listing.js");

// middleware
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");

// image upload
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

/* ================= ROUTES ================= */

// 🔍 SEARCH ROUTE (KEEP THIS ABOVE :id)
router.get(
  "/search",
  wrapAsync(async (req, res) => {
    const { q } = req.query;

    if (!q || q.trim() === "") {
      return res.redirect("/listing");
    }

    const listings = await Listing.find({
      $or: [
        { title: { $regex: q, $options: "i" } },
        { location: { $regex: q, $options: "i" } },
        { country: { $regex: q, $options: "i" } },
      ],
    });

    res.render("listing/index", {
      listings,
      currUser: req.user,
      searchQuery: q,
    });
  })
);

// INDEX + CREATE
router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedIn,
    upload.single("image"),
    validateListing,
    wrapAsync(listingController.createListings)
  );

// NEW
router.get("/new", isLoggedIn, listingController.renderNewForm);

// SHOW / UPDATE / DELETE
router
  .route("/:id")
  .get(wrapAsync(listingController.showRoutes))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("image"),
    validateListing,
    wrapAsync(listingController.updateListing)
  )
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));

// EDIT
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.editForm)
);

module.exports = router;
