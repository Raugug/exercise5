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

//const Message = db1.model('Message', messageSchema);
//module.exports = Message;
module.exports = DB => DB.model('Message', messageSchema);