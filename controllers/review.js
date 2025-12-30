const Listing = require("../models/listing.js");
const Review = require("../models/review");


module.exports.createReview = async (req, res) => {
  const { id } = req.params;  // get listing id from URL
  const listing = await Listing.findById(id);

  if (!listing) {
    throw new ExpressError(404, "Listing not found");
  }
  
  const newReview = new Review(req.body.review);
  newReview.author = req.user._id;
  listing.reviews.push(newReview);
  await newReview.save();
  await listing.save();

  req.flash("success", "Successfully created a new Review!");

  console.log("✅ Review Added");
  res.redirect(`/listing/${listing._id}`);
}

module.exports.deleteReview = async (req, res) => {
  const { id, reviewId } = req.params;

  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);

  console.log("✅ Review deleted successfully!");

  req.flash("success", "Successfully Review Deleted!");
  res.redirect(`/listing/${id}`);
}