const mongoose = require("mongoose");


mongoose.connect("mongodb://localhost:27017/ecom");
// console.log("mongoDb" , process.env.MONGODB_URL);
// check the connection
const db = mongoose.connection;
// console.log("mongo", db);
// on error
db.on('error', console.error.bind(console, "Error connecting to MongoDb"));

// if server is up and running
db.once('open', function(){
    console.log("Connected to Database :: MongoDB");
});

module.exports = db;