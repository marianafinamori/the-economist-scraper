//Scrape and update list
$(".scrape-btn").on("click", (event) => {
    $.ajax({
        method:"GET",
        url: "/articles"
    })
    .then((data) => {
        setTimeout(() => { window.location = "/articles"}, 4000);
    })

    let wait = document.querySelector("#wait-div")
    wait.classList.add('wait-msg');
    wait.innerHTML = "Scraping...";
    setTimeout(() => {
        wait.innerHTML = " ";
        wait.classList.remove('wait-msg')
    }, 4000);
})

//Save an article
$(".save-article-btn").on("click", function(event) {
    let id = $(this).attr("data-id");
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
    let id = $(this).attr("data-id");
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
    let id = $(this).data("id");
    $.ajax("/articles/" + id, {
        type: "DELETE",
    })
    .then(function(data) {
        console.log("deleted article", id);
        location.reload();
    });   
});


//SEE COMMENTS FOR EACH ARTICLE
$(".add-note-btn").on("click", function(event) {
    let articleid = $(this).attr("data-id");
    console.log("article id passed to post btn" + articleid)
    $.ajax({
        method: "GET",
        url: "/notes/" + articleid
    })
    .then(function(data) {
        $("#comments-div").empty();
        $("#article-commented-div").empty();
        console.log("MODAL DATA")
        console.log(data);
        $("#post-btn").attr("data-id", data.articleId)
        let article = $("<h5 id=article-commented>Article: " + data.title + "</h5>");
        $("#article-commented-div").append(article);
        console.log(article)
        if (data.comments.length > 0) {
            data.comments.forEach(note => { 
                let comment = $("<p class=comment-text>" + note.body + "</p>") 
                let commentDelete = $("<div class=delete-comment-btn data-id=" + note.id + "><i class='fa fa-trash'></i></div>")
                let commentItem = $("<div class=comment-item></div>")
                commentItem.append(comment, commentDelete)
                $("#comments-div").append(commentItem)
            });
        } else if (data.comments.length === 0) {
            console.log("no comments")
            let nocomments = $("<p>No comments added</p>")
            $("#comments-div").append(nocomments)
        }
    });
    $('#comments-modal').modal('show');
});

//POST A COMMENT
$(document).on("click", "#post-btn", function() {
    let articleid = $(this).attr("data-id");
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
        location.reload();
    });
})
  
//DELETE COMMENT
$(document).on("click", ".delete-comment-btn", function(event){
    event.preventDefault();
    let id = $(this).attr("data-id");
    console.log(id);
    $.ajax({
        method: "DELETE",
        url: "/notes/" + id 
    })
    .then(function() {
        location.reload()
    })
})

      
