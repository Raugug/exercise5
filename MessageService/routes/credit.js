const express = require('express');
const router = express.Router();
const dbService = require('../dbService/dbService');
const validator = require('../validatorCredit');
const uuidv1 = require('uuid/v1');
const rateLimit = require("express-rate-limit");
let retryAddCounter = 0;
const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 min window
    max: 10, // 100 requests per window
    message:
      ({status: "Too many requests from this IP, please try again after a minute"})
  });

  const tryCreditUpdate = (amount) => {
    return new Promise((resolve, reject)=>{
      dbService.addCredit(amount)
      .then(credit => {
        console.log("Credit added:", credit)
        resolve(credit);
      })
      .catch(err => {
        if (retryAddCounter >= 5) reject;
        console.log(err);
        retryAddCounter++;
        tryCreditUpdate(amount)
      })
    })
}

  router.post('/', apiLimiter, validator(), (req, res, next) => {
    let uuid = uuidv1();
    dbService.enqueue(uuid);
    console.log("ENQUEUED", dbService.queue)  
    let {amount} = req.body
    if ( dbService.queue.length > 0 && !dbService.lock) {
      console.log("IF NO LOCK", dbService.lock, dbService.queue);
      dbService.lock = true;
      tryCreditUpdate(amount)
        .then(credit =>{
          console.log("CREDIT ADDED", credit.amount)
          dbService.lock = false;
          dbService.dequeue();
          res.status(200).json({
            status: "200",
            data: credit.amount
            })
      }).catch (err => {
          console.log("ADD CREDIT ERROR")
          dbService.lock = false;
          dbService.dequeue();
          res.status(500).json({data: "RECHARGE FAILED, TRY AGAIN"});
          return;
      })
    }//if (dbService.lock) console.log("LOCKED");


  })



module.exports = router;