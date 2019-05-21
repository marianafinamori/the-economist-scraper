const express = require("express");
const mongoose = require("mongoose");
const logger = require("morgan");
const axios = require("axios");
const cheerio = require("cheerio");
const mongojs = require("mongojs")
const bodyParser = require("body-parser");
var router = express.Router();
var path = require("path");
const db = require("./models");
const PORT = process.env.PORT || 3000;
const app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());
// Make public a static folder
app.use(express.static("public"));
// app.use(express.static(__dirname + '../public'));
// app.use(bodyParser.urlencoded({ extended: false}));
mongoose.Promise = Promise;

// If deployed, use the deployed database. Otherwise use the local economist database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/economist";
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });
var checkdb = mongoose.connection;
//Check DB connection

checkdb.once('open', function() {
  console.log("connected to mongoDB")
});

//Check for DB errors
checkdb.on("error", function(err) {
  console.log(err);
})

// // Connect to the Mongo DB
// mongoose.connect("mongodb://localhost/economist", { useNewUrlParser: true });
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Handlebars
var exphbs = require("express-handlebars");
// app.set('views', path.join(__dirname, 'views'));
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");


//ROUTES
//===================================

//Route for HOME 
app.get("/", function(req, res) {
  db.Article.find({saved: false}, function(err, articles) {
    if(err) {
      console.log(err);
    } else {
      // res.send("Hello world")
      console.log(articles);
      res.render("index", { articles: articles})
    }
  })
  // res.send("hello")
})

// app.get("/articles/add", function(req, res) {
//   res.render("add", {title: "add article"})
  
// })
 

//A GET ROUTE for SCRAPING The Economist website
app.get("/scrape", function(req, res) {
    //First we grab the body of the html with axios
    axios.get("https://www.economist.com/international/").then(function(response) {
        var $ = cheerio.load(response.data);
        // var results = [];
        $(".teaser").each(function(i, element) {
            var result = {}
            result.title = $(element).find(".flytitle-and-title__title").text()
            result.link = "https://www.economist.com" + $(element).find("a").attr("href");
            result.descr = $(element).find(".teaser__text").text();
            // console.log(result.title);
            // console.log(result.link);
            // console.log(result.descr);

            //Create a new Article using the "result" object build from scraping
            db.Article.create(result)
            .then(function(dbArticle) {
                //View the added result in the console
                console.log(dbArticle)
            })
            .catch(function(err) {
                // If an error occurred, log it
                console.log(err);
            })
            // res.json(result);
        })
        // res.send("Scrape Complete")
        // console.log("before send json")
        res.json(result);
    })
})




// Route for getting ALL ARTICLES from the db
app.get("/all", function(req, res) {
    db.Article.find({}, function(err, data) {
      if(err) {
        console.log(err);
      } else {
        res.render("all", {articles: data})
        res.json(data)
      }
    })
  });

  