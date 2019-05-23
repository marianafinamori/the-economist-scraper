var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var NoteSchema = new Schema({

  articleref: {
    type: Schema.Types.ObjectId,
    ref: "Article"
  }, 
 
  body: {
    type: String
  }
});

var Note = mongoose.model("Note", NoteSchema);

module.exports = Note;