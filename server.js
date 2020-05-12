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
// var exphbs = require("express-handlebars");
// // app.set('views', path.join(__dirname, 'views'));
// app.engine("handlebars", exphbs({ defaultLayout: "main" }));
// app.set("view engine", "handlebars");

//Handlebars new
const Handlebars = require('handlebars')
const expressHandlebars = require('express-handlebars');
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access')
 
app.engine('handlebars', expressHandlebars({
    handlebars: allowInsecurePrototypeAccess(Handlebars),
    defaultLayout: "main"
}));
app.set('view engine', 'handlebars');


//ROUTES
//===================================

app.get("/", function(req, res) {
  db.Article.deleteMany({saved: false}, function(err, articles) {
    if(err) {
      console.log(err);
    } else {
      // res.send("Hello world")
      // console.log(articles);
      res.render("index")
    }
  })
})
//A GET ROUTE for SCRAPING The Economist website
app.get("/articles", function(req, res) {
    axios.get("https://www.economist.com/international/").then(function(response) {
        var $ = cheerio.load(response.data);
        // var results = [];
        $(".teaser").each(function(i, element) {
            var result = {}
            result.title = $(element).find(".teaser__headline").text()
            result.link = "https://www.economist.com" + $(element).find("a").attr("href");
            result.descr = $(element).find(".teaser__description").text();
            console.log(result.title);
            console.log(result.link);
            console.log(result.descr);

            // Create an ARTICLE in the DB using the "result" object built from scraping
            db.Article.create(result)
            .then(function(dbArticle) {
                // console.log(dbArticle)
                // console.log("create docs in the DB")
            })
            .catch(function(err) {
                console.log("this is the ERROR: " + err);
            })
        })
        // console.log("scrape is completed and collection is created"   
    })
  
    //Collection created, now we find articles in DB
    db.Article.find({saved: false}, function(err, articles) {
      if(err) {
        console.log(err);
      } else {
        console.log("this are the searched articles" + articles)
        console.log("created DB and is know searching")
        res.render("all", { articles: articles})
      }
    })
})

  //Route for SAVED ARTICLES
  app.get("/saved", function(req, res) {
    db.Article.find({saved: true}, function(err, articles) {
      if(err) {
        console.log(err)
      } else {
        res.render("saved", { articles: articles })
      }
    })
  })

   //SAVE article
   app.put("/statussaved/:id", function(req, res) {
    saveStatus(true,req, res);
});

//UNSAVE article
app.put("/statusnotsaved/:id", function(req, res) {
    saveStatus(false, req, res);
});

function saveStatus(isSaved, req, res) {
    db.Article.findOneAndUpdate({ _id: req.params.id }, { saved: isSaved },
        function(err, data) {
            if (err) {
                console.log(err);
            }
            else {
            res.json(data);
            }
    });
}

//Route to get a specific ARTICLE and populate with note
app.get("/articles/:id", function(req, res) {
  db.Article.findOne({ _id: req.params.id })
  .populate("note")
  .then(function(dbArticle) {
      res.json(dbArticle);
  })
  .catch(function(err) {
      res.json(err);
  });
});

//Route for an article related to a note
app.get("/notes/:id", function (req, res) {
  if(req.params.id) {
      db.Note.find({
          "article": req.params.id
      })
      .exec(function (error, doc) {
          if (error) {
              console.log(error)
          } else {
              res.send(doc);
          }
      });
  }
});

//Route to CREATE a NOTE
app.post("/notes", function (req, res) {
  if (req.body) {
      db.Note.create(req.body)
      .then(function(dbNote) {
          res.json(dbNote);
      })
      .catch(function(err) {
          res.json(err);
      });
  }
  });


 //Route to DELETE an ARTICLE
app.delete("/articles/:id", function(req, res) {
  db.Article.deleteOne({ _id: req.params.id }, function(err, data) {
    if (err) {
      console.log(err);
    } else {
        res.json(data);
     }
  });
});

  //Route to DELETE a NOTE
  app.delete("/notes/:id", function(req, res) {
    db.Note.deleteOne({ _id: req.params.id },
        function(err, data) {
            if (err) {
                console.log(err);
            }
            else {
            res.json(data);
            }
    });
});
  
  //START SERVER
  app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
  });