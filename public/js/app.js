

//Scrape and update list
$("#scrape-btn").on("click", function(event) {
    $.ajax({
        method:"GET",
        url: "/scrape"
    })
    .then(function() {
        console.log("scrape and create mongoDB documents done")
        
    })
})

$("#results-btn").on("click", function(event) {
    $.ajax({
        method: "GET",
        url: "/articles"
    })
    .then(function(data) {
        // console.log("show results")
        console.log(data)
        window.location = "/articles"
    })
})
  
//Save an article
$(".save-article-btn").on("click", function(event) {
    var id = $(this).attr("data-id");
    console.log(id)
    $.ajax({
        method: "PUT",
        url: "/statussaved/" + id,
    })
    .then(function(data) {
        console.log(data);
        location.reload();
    });
});

//Remove from saved list
$(".delete-saved-btn").on("click", function(event) {
    var id = $(this).attr("data-id");
    $.ajax({
        method: "PUT",
        url: "/statusnotsaved/" + id
    })
    .then(function(data) {
        console.log(data);
        location.reload();
    });
});


  //DELETE ARTICLE from results
  $(".delete-article-btn").on("click", function(event) {
    var id = $(this).data("id");
        $.ajax("/articles/" + id, {
            type: "DELETE",
        }).then(
            function() {
            console.log("deleted article", id);
            location.reload();
            }
        );
   
});

  //ADD COMMENT
  $(".add-note-btn").on("click", function(event) {
    var articleid = $(this).attr("data-id");
    $("#post-btn").attr("data-id", articleid)
    console.log(articleid)
    // var id = $(this).attr("data-id");
    //   $('#comments-modal').modal('show');
      $.ajax({
          method: "GET",
          url: "/notes/" + articleid
      })
          .then(function(data) {
              console.log(data);
            //   $("#post-btn").attr("data-id", id)
              console.log(articleid)
              if (data.length > 0) {
                var article = $("<p id=article-commented>Article ref: " + data[0].article + "</p>");
                $("#comments-div").append(article);
                console.log(article)
                for (var i = 0; i < data.length; i++) {
                    var body = data[i].body;
                    var comment = $("<p class=pcomment>" + body + "</p>") 
                    var commentDelete = $("<button class=delete-comment-btn data-id=" + data[i]._id + " type=button class=close data-dismiss=modal aria-label=Close><span aria-hidden=true>&times;</span>)")
                  //   console.log(body)
                    var commentItem = $("<li class=comment-item class=comment-item></li>")
                    $(".comment-item").append(comment, commentDelete)
                    $("#comments-div").append(commentItem)
                } 
              } else {
                  var nocomments = $("<p>No comments added</p>")
                  $("#comments-div").append(nocomments)

              }
             
          });
          $('#comments-modal').modal('show');
  });

  $(document).on("click", "#post-btn", function() {
    var articleid = $(this).attr("data-id");
    // var id = $(this).data("id");
    // var id = $(this).attr("data-id");
          $.ajax({
                  method: "POST",
                  url: "/notes",
                  data: {
                    article: articleid,
                    body: $("#commenttextarea").val(), 
                  }
          })
          .done(function(data) {
              console.log(data);
              $("#commenttextarea").val("");
              $('#comments-modal').modal('hide');
              window.location = "/saved"
            
          });
      })
  

  //DELETE COMMENT
  $(document).on("click", ".delete-comment-btn", function(event){
      event.preventDefault();
      var id = $(this).attr("data-id");
      console.log(id);
        $.ajax({
            method: "DELETE",
            url: "/notes/" + id 
        })
        .then(function() {
            location.reload()
        })
    })

      
