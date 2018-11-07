const express = require("express");
const mongoose = require("mongoose");
const uuidv1 = require("uuid/v1");
let DB1;
let DB2;
let Credit;
let Message;
let Credit2;
let Message2;
const connectCounter = 0;

const options = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  autoIndex: false, // Don't build indexes
  reconnectTries: 1000,
  reconnectInterval: 500
};

class _dbService {
  constructor() {
    this.uuidWallet = uuidv1();
    this.lock = false;
    this.lock2 = false;
    this.queue = [];
    this.queue2 = [];
    this.roleDB = [];
    this.main = { db: null, op: 0, Message: null, Credit: null, active: false };
    this.second = {
      db: null,
      op: 0,
      Message: null,
      Credit: null,
      active: false
    };
  }

  connect(url) {
    let db;
    let mssg;
    let crd;
    return mongoose.createConnection(url, options, (err, res) => {
      if (err) {
        console.error("Error connecting to mongo", err);
      } else {
        if (url == DBURL) {
          DB1 = res;
          Message = require("./models/Message")(DB1);
          Credit = require("./models/Credit")(DB1);
          db = DB1;
          mssg = Message;
          crd = Credit;
        } else {
          DB2 = res;
          Message2 = require("./models/Message2")(DB2);
          Credit2 = require("./models/Credit2")(DB2);
          db = DB2;
          mssg = Message2;
          crd = Credit2;
        }
        console.log(`Connected to Mongo. DB: "${db.name}"`);
        if (this.main.db == null)
          this.main = { db: db, Message: mssg, Credit: crd, active: true };
        else this.second = { db: db, Message: mssg, Credit: crd, active: true };
        console.log("main name", this.main.db.name);
        if (this.second.db != null)
          console.log("replica name", this.second.db.name);
        if (this.main.db && this.second.db) this.createWallet(5);
      }
    });
  }

    switchMain(db) {
        if (this.main.db === db) {
            if (this.second.active) {
                let copy = this.main;
                this.main = this.second;
                this.second = copy;
                this.second.active = false;
                console.log("SWITCH", this.main.db.name, this.second.db.name);
            } else {this.main.active = false}
        } else {
            console.log("NO SWITCH", this.main.db.name, this.second.db.name);
            this.second.active = false;
        }
    }

  create(destination, body, status, uuid) {
    return new Promise((resolve, reject) => {

        this.main.Message.create({
            destination: destination,
            body: body,
            status: status,
            uuid: uuid
        })
        .then(message => {
            this.second.Message.create({
                destination: destination,
                body: body,
                status: status,
                uuid: uuid
            })
            resolve(message);
        })
        .catch(err => {reject})
    })
    
  }

  updateStatus(uuid, status) {
    return new Promise((resolve, reject) => {

        this.main.Message.findOneAndUpdate(
            { uuid: uuid },
            { status: status, $inc: { counter: 1 } },
            { new: true }
        )
        .then(message => {
            this.second.Message.findOneAndUpdate(
                { uuid: uuid },
                { status: status, $inc: { counter: 1 } },
                { new: true }
            )
            resolve(message);

        })
        .catch(err => {reject})
    })
  }

  getAll() {
    return Message.find();
  }

  createWallet(amount, uuid = this.uuidWallet) {
    this.main.Credit.create({ amount: amount, uuid: uuid })
      .then(wallet1 => {
        this.second.Credit.create({ amount: amount, uuid: uuid })
          .then(wallet2 => {
            console.log("wallets created", wallet1, wallet2);
          })
          .catch(err => console.log(err));
      })
      .catch(err => console.log(err));
  }

  addCredit(amount) {
    return new Promise((resolve, reject) => {
      this.main.Credit.findOneAndUpdate(
        { uuid: this.uuidWallet },
        { $inc: { amount: amount, counter: 1 } },
        { new: true }
      )
        .then((credit) => {
          if (this.second.active){
          this.second.Credit.findOneAndUpdate(
            { uuid: this.uuidWallet },
            { $inc: { amount: amount, counter: 1 } },
            { new: true }
          )
            .then((creditCopy) => {console.log("2DB OK", creditCopy);resolve(credit)})
          } else {
                console.log("ERROR SECOND DB")
                this.main.Credit.findOneAndUpdate(
                    { uuid: this.uuidWallet },
                    { $inc: { amount: -amount, counter: -1 } },
                    { new: true }
                  ).then(oldamount => {console.log("UNDONE TRANSACTION OK");reject;})
                  .catch(error => {console.log("ERROR UNDONE TRANSACTION");reject;})
                  reject;
            }
            reject;
        })
        .catch(err => {console.log("ERROR MAIN DB");reject});
    });
  }

  payMessage(price) {
      return new Promise((resolve, reject)=> {
          this.main.Credit.findOneAndUpdate(
              { uuid: this.uuidWallet },
              { $inc: { amount: -price, counter: 1 } },
              { new: true }
          )
          .then((credit) => {
            if (this.second.active){
                this.second.Credit.findOneAndUpdate(
                  { uuid: this.uuidWallet },
                  { $inc: { amount: -price, counter: 1 } },
                  { new: true }
                )
                  .then((creditCopy) => {console.log("2DB OK", creditCopy);resolve(credit)})
                } else {
                      console.log("ERROR SECOND DB")
                      this.main.Credit.findOneAndUpdate(
                          { uuid: this.uuidWallet },
                          { $inc: { amount: price, counter: -1 } },
                          { new: true }
                        ).then(oldamount => {console.log("UNDONE TRANSACTION OK");reject;})
                        .catch(error => {console.log("ERROR UNDONE TRANSACTION");reject;})
                        reject;
                  }
                  reject;

          })
          .catch(err => {console.log("ERROR MAIN DB");reject});

      });
  }

  getCredit() {
    return this.main.Credit.findOne({ uuid: this.uuidWallet });
  }

  enqueue(uuid) {
    this.queue.unshift(uuid);
  }
  dequeue() {
    this.queue.pop();
  }
}

const dbService = new _dbService();
module.exports = dbService;
