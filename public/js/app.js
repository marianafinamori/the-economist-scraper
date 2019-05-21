$(window).load(function() {

  $("#scrape-btn").on("click", function(event) {
    
          $.ajax({
              method:"GET",
              url: "/scrape"
          })
         
          .then(function(data) {
              
                  $("#articles-found-modal-close").on("click", function(event) {
                     
                      location.reload();
                  });
              })
          })
      });


  
