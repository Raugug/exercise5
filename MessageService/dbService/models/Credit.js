const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const creditSchema = new Schema({
  amount: {type: Number, default: 0},
  lock: String,
  uuid: String,
  counter: {type: Number, default: 0}
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

//const Credit = db1.model('Credit', creditSchema);
//module.exports = Credit;
module.exports = DB => DB.model('Credit', creditSchema);