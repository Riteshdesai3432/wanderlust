const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

// define URL at top level
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("Connected to DB");
  })
  .catch(err => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);  // now it can access MONGO_URL
}

const initDB = async () => {
  await Listing.deleteMany({});

  initData.data = initData.data.map((obj) => ({
    ...obj,
    owner:'69214fef03c6029ea56dc1a3', 
  }));

  await Listing.insertMany(initData.data);
  console.log("Data was initialised");
};


initDB();
