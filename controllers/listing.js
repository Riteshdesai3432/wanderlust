const Listing = require("../models/listing.js");
const Review = require("../models/review");
// const { geocodeLocation } = require("../utils/geocode");
const axios = require("axios");

const geocodeLocation = async (location) => {
  const response = await axios.get(
    "https://nominatim.openstreetmap.org/search",
    {
      params: {
        q: location,
        format: "json",
        limit: 1
      },
      headers: {
        "User-Agent": "wanderlust-project"
      }
    }
  );

  if (!response.data.length) return null;

  return {
    lat: response.data[0].lat,
    lng: response.data[0].lon
  };
};

module.exports.index = async (req, res) => {
  const listings = await Listing.find({});
  res.render("listing/index", {
    listings,
    currUser: req.user,
  });
};


module.exports.renderNewForm = (req, res) => {
  res.render("listing/new.ejs");
}

module.exports.createListings = async (req, res) => {
  const { location } = req.body.listing;

  // ✅ GEOCODE LOCATION
  const coords = await geocodeLocation(location);

  if (!coords) {
    req.flash("error", "Invalid location entered");
    return res.redirect("/listing/new");
  }

  const newListing = new Listing(req.body.listing);

  // ✅ SAVE GEOMETRY FOR MAP
  newListing.geometry = {
    type: "Point",
    coordinates: [coords.lng, coords.lat] // IMPORTANT ORDER
  };

  // ✅ OWNER
  newListing.owner = req.user._id;

  // ✅ IMAGE
  if (req.file) {
    newListing.image = {
      url: req.file.path,
      filename: req.file.filename
    };
  }

  await newListing.save();
  req.flash("success", "Successfully created a new listing!");
  res.redirect(`/listing/${newListing._id}`);
};



// module.exports.createListings = async (req, res) => {
//   let url = req.file.path;
//   let filename = req.file.filename;
//   const newListing = new Listing(req.body.listing);
//   newListing.owner = req.user._id;
//   newListing.image = {url,filename};
//   await newListing.save();
//   req.flash("success", "Successfully created a new listing!");
//   res.redirect("/listing");
// }


module.exports.showRoutes = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: 'author' } })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listing");
  }

  // Pass JSON version of listing to avoid EJS-in-JS issues
  res.render("listing/show.ejs", { listing, listingJSON: JSON.stringify(listing) });
}


// module.exports.showRoutes = async (req, res) => {
//   const { id } = req.params;
//   const listing = await Listing.findById(id).populate({path: "reviews",populate:{ path: 'author'}}).populate("owner");

//   if (!listing) {
//     req.flash("error", "Listing not found!");
//     return res.redirect("/listing");   // 👈 FIXED: return added
//   }

//   res.render("listing/show.ejs", { listing });
// }

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