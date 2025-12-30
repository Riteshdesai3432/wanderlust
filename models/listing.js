const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// ✅ Import the Review model
const Review = require("./review");
const { ref } = require("joi");

const listingSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  image: {
    url: String,
    filename: String,
  },
  price: Number,
  location: String,
  country: String,
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review"
    }
  ],
  
  owner: {
    type:Schema.Types.ObjectId,
    ref: "User",
  }
});

// ✅ Middleware to delete all related reviews when a listing is deleted
listingSchema.post("findOneAndDelete", async function (listing) {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
    console.log("✅ All related reviews deleted for listing:", listing._id);
  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
