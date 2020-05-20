const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const router = express.Router();
const db = require("../models/");

//Homepage
router.get("/", function(req, res) {
    db.Article.deleteMany({saved: false}, function(err, articles) {
      if(err) {
        console.log(err);
      } else {
        scrapeAndSave()
        res.render("index")
      }
    })
  })
  
//Scrape and Save to DB
function scrapeAndSave() {
    axios.get("https://www.economist.com/international/")
    .then(function(response) {
          let $ = cheerio.load(response.data);
          $(".teaser").each(function(i, element) {
              let result = {}
              result.title = $(element).find(".teaser__headline").text()
              result.link = "https://www.economist.com" + $(element).find("a").attr("href");
              result.descr = $(element).find(".teaser__description").text();
              db.Article.insertMany(result)
              .then(function(dbArticle) {
                    // console.log(dbArticle)
                })
                .catch(function(err) {
                    console.log("this is the ERROR: " + err);
                })
          })
        })
    }

//Get scraped articles from DB
router.get("/articles", function(req, res) {
    db.Article.find({saved: false}, function(err, articles) {
        if(err) {
            console.log(err);
        } else {
            res.render("all", { articles: articles})
            // console.log(articles)
        }
    })
})
  
//Route to DELETE an ARTICLE from all results
router.delete("/articles/:id", function(req, res) {
    db.Article.deleteOne({ _id: req.params.id }, function(err, data) {
        if (err) {
            console.log(err);
        } else {
            console.log("DELETE " + req.params.id)
            res.json(data);
        }
    });
});
  
//Route for SAVED ARTICLES
router.get("/saved", function(req, res) {
    db.Article.find({saved: true}, function(err, articles) {
        if(err) {
            console.log(err)
        } else {
            res.render("saved", { articles: articles })
        }
    })
})

//SAVE article
router.put("/statussaved/:id", function(req, res) {
    saveStatus(true,req, res);
});
  
//UNSAVE article
router.put("/statusnotsaved/:id", function(req, res) {
    saveStatus(false, req, res);
});
  
function saveStatus(isSaved, req, res) {
    db.Article.findOneAndUpdate({ _id: req.params.id }, { saved: isSaved },
        function(err, data) {
            if (err) {
                console.log(err);
            } else {
                res.json(data);
            }
        });
    }
  
//Route for an article related to a note
router.get("/notes/:id", function(req, res) {
    db.Article.findOne({_id: req.params.id}, function(err, article) {
      let feedComment = {}
      if(err) {
        console.log(err) 
      } else {
        feedComment.title = article.title
        feedComment.articleId = article._id
        db.Note.find({article: req.params.id}, function(err, notes) {
            if(err) {
            console.log(err)
          }
            else {
                feedComment.comments = []
                notes.forEach(function(note) {
                    let comment = {}
                    comment.id = note._id
                    comment.body = note.body
                    feedComment.comments.push(comment)
                })
            }
            res.json(feedComment)
            console.log(feedComment)
      })
    }
    })
})

// Route to CREATE a NOTE
router.post("/notes", function (req, res) {
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
  
 
//Route to DELETE a NOTE
router.delete("/notes/:id", function(req, res) {
    db.Note.deleteOne({ _id: req.params.id }, function(err, data) {
        if (err) {
            console.log(err);
        } else {
            res.json(data);
        }
    });
});

module.exports = router;