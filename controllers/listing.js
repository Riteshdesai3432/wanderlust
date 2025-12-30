const Listing = require("../models/listing.js");
const Review = require("../models/review");
// const { geocodeLocation } = require("../utils/geocode");
const axios = require("axios");


module.exports.index = async (req, res) => {
  const allListing = await Listing.find({});
  res.render("listing/index.ejs", { allListing });
}

module.exports.renderNewForm = (req, res) => {
  res.render("listing/new.ejs");
}

//geocoding

// module.exports.createListings = async (req, res) => {
//   const { location } = req.body.listing;

//   const geoData = await geocodeLocation(location);

//   const newListing = new Listing(req.body.listing);
//   newListing.geometry = {
//     type: "Point",
//     coordinates: [geoData.lng, geoData.lat]
//   };

//   newListing.owner = req.user._id;
//   await newListing.save();

//   req.flash("success", "Successfully created a new listing!");
//   res.redirect("/listing");
// };


module.exports.createListings = async (req, res) => {
  let url = req.file.path;
  let filename = req.file.filename;
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = {url,filename};
  await newListing.save();
  req.flash("success", "Successfully created a new listing!");
  res.redirect("/listing");
}

module.exports.showRoutes = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id).populate({path: "reviews",populate:{ path: 'author'}}).populate("owner");

  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listing");   // 👈 FIXED: return added
  }

  res.render("listing/show.ejs", { listing });
}

module.exports.editForm = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listing");
  }
  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload","/upload/w_250");
  res.render("listing/edit.ejs", { listing, originalImageUrl });
}

module.exports.updateListing = async (req, res) => {
  const { id } = req.params;

  let listing = await Listing.findByIdAndUpdate(
    id,
    { ...req.body.listing },
    { new: true }   // ✅ VERY IMPORTANT
  );

  if (req.file) {
    let url = req.file.path;
    let filename = req.file.filename;

    listing.image = { url, filename };
    await listing.save();
  }

  req.flash("success", "Successfully updated listing!");
  res.redirect(`/listing/${id}`);
};

// module.exports.updateListing = async (req, res) => {
//   const { id } = req.params;
//   let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

//   if(typeof req.file != "undefined"){
   
//     let url = req.file.path;
//     let filename = req.file.filename;
//     listing.image = {url,filename};
//     await listing.save();
//   }
//   req.flash("success", "Successfully updated listing!");
//   res.redirect(`/listing/${id}`);
// }

module.exports.deleteListing = async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findById(id);

  if (listing) {
    // delete all reviews linked to this listing
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }

  await Listing.findByIdAndDelete(id);
  req.flash("success", "Successfully deleted listing!");
  res.redirect("/listing");
}