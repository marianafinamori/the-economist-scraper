//Scrape and update list
$("#scrape-btn").on("click", function(event) {
    $.ajax({
        method:"GET",
        url: "/scrape"
    })
    .then(function(data) {
        location.reload();  
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


  //Remove from scrape results list
  $(".delete-article-btn").on("click", function(event) {
      var id = $(this).attr("data-id");
      console.log(id)
          $.ajax({
              method: "DELETE",
              url: "/articles/" + id 
          })
          .then(function(data) {
              location.reload();
            });  
  });

  //Click event to open the article notes/comments modal.
  $(".add-note-btn").on("click", function(event) {
    var id = $(this).attr("data-id");
      $('#comments-modal').modal('show');
      $.ajax({
          method: "GET",
          url: "/notes/" + id
      })
          .then(function(data) {
              console.log(data);
          });
  });

  $(document).on("click", "#post-btn", function() {
      var id = $(this).attr("data-id");
          $.ajax({
                  method: "POST",
                  url: "/notes",
                  data: {
                    article: id,
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
  

  //Click event to delete a comment.
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

      
