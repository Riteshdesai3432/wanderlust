const joi = require('joi');

// ✅ Schema for validating listing data
module.exports.listingSchema = joi.object({
  listing: joi.object({
    title: joi.string().required(),
    description: joi.string().required(),
    location: joi.string().required(),
    price: joi.number().min(0).required(),
    country: joi.string().required(),

    // ✅ FIXED IMAGE VALIDATION
     image: joi.object({
      filename: joi.string().allow("", null),
      url: joi.string().allow("", null)
    }).optional()   // ✅ NOT required
  }).required()
});

// ✅ Schema for validating review data
module.exports.reviewSchema = joi.object({
  review: joi.object({
    rating: joi.number().min(1).max(5).required(),
    comment: joi.string().required()
  }).required()
});
       