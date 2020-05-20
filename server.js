const express = require("express");
const mongoose = require("mongoose");
const PORT = process.env.PORT || 3000;
const app = express();


// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set public a static folder
app.use(express.static("public"));


// If deployed, use the deployed database. Otherwise use the local economist database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/economist";
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true});
var checkdb = mongoose.connection;

//Check DB connection
checkdb.once('open', function() {
  console.log("connected to mongoDB")
});

//Check for DB errors
checkdb.on("error", function(err) {
  console.log(err);
})

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/economist", { useNewUrlParser: true });

// Handlebars
// var exphbs = require("express-handlebars");
// app.set('views', path.join(__dirname, 'views'));
// app.engine("handlebars", exphbs({ defaultLayout: "main" }));
// app.set("view engine", "handlebars");

//Handlebars version later than 4.6.0
const Handlebars = require('handlebars')
const expressHandlebars = require('express-handlebars');
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access')
 
app.engine('handlebars', expressHandlebars({
    handlebars: allowInsecurePrototypeAccess(Handlebars),
    defaultLayout: "main"
}));
app.set('view engine', 'handlebars');

//Routes files
const routes = require("./routes/routes.js")
app.use(routes);
  
//START SERVER
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});