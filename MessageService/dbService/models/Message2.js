const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const messageSchema = new Schema({
  destination: String,
  body: String,
  opNumber: Number,
  status: String,
  uuid: String,
  counter: {type: Number, default: 0}
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

//const Message2 = mongoose.model('Message2', messageSchema);
module.exports = DB => DB.model('Message2', messageSchema);