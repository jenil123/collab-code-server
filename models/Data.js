const mongoose = require('mongoose')
const DataSchema = mongoose.Schema({
  roomId: {
    type: String,
    required: true,
  },
  text: {
    type: String,
  },
  langauge: {
    type: String,
  },
  theme: {
    type: String,
  },
  input: {
    type: String,
  },
  output: {
    type: String,
  },
})

const DataModel = mongoose.model('Code-Data', DataSchema)
module.exports = DataModel
