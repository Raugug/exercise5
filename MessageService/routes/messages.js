const express = require('express');
const router = express.Router();
var axios = require('axios')
const rateLimit = require("express-rate-limit");
const dbService = require('../dbService/dbService');
const validator = require('../validatorMssg');
const uuidv1 = require('uuid/v1');
let retryCounter = 0;
let retryUpdateCounter = 0;
const price = 1;
const messageapp = axios.create({
  baseURL: 'http://messageapp:3000',
  //baseURL: 'http://localhost:3000',
  timeout: 2500
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min window
  max: 100, // 100 requests per window
  message:
    ({status: "Too many requests from this IP, please try again after a minute"})
});


router.get('/', apiLimiter, (req, res, next) => {
  dbService.getAll().then(messages => {
    res.status(200).json({data: messages})
    console.log("MESSAGES READED", messages)

  }).catch(err => console.log(err))
})

const tryMessageCreate = (destination, body, status, uuid) =>{
    return new Promise((resolve, reject) => {
      dbService.create(destination, body, status, uuid)
      .then(message => {
        console.log("Message Registry Created:", message)
        resolve(message)
      })
      .catch (err => {
        console.log(err)
        if(retryCounter == 5) reject;
        retryCounter++;
        tryMessageCreate(destination, body, status, uuid)
      })
    })
}
  
const tryMessageUpdate = (status, uuid) => {
    return new Promise((resolve, reject)=>{
      dbService.updateStatus(uuid, status)
      .then(message => {
        console.log("Message Creation Registry Updated:", message)
        resolve(message);
      })
      .catch(err => {
        if (retryUpdateCounter == 5) reject;
        console.log(err);
        retryUpdateCounter++;
        tryMessageUpdate(status, uuid)
      })
    })
}

const postMessage = (destination, body, uuid, status, res) => {
  messageapp.post('/message', { destination, body })
    .then(response => {

      dbService.payMessage(price)
        .then(credit => {
          console.log("Payment successful; credit:", credit)
          status = "Confirmed";
          dbService.lock = false;
          dbService.dequeue();
          console.log("queue AFTER postMessge", dbService.queue)
          tryMessageUpdate(status, uuid)
            .then(message => {
              console.log("POST succeeded: ", response.data);
              res.status(200).json({
                status: "200",
                data: response.data
              })
            })
            .catch(() => {
              console.log("STORAGE ERROR")
              res.status(500).json({ data: "STORAGE ERROR 1, TRY AGAIN" })
              return;
            })

        })
        .catch(err => {
          console.log("PAYMENT ERROR")
          dbService.lock = false;
          dbService.dequeue();
          console.log("queue AFTER postMessge", dbService.queue)
          res.status(500).json({ data: "PAYMENT ERROR, TRY AGAIN" })
          return;
        })

    })
    .catch(err => {
      dbService.lock = false;
      dbService.dequeue();
      console.log("queue AFTER postMessge", dbService.queue)
      if (err.code && err.code === 'ECONNABORTED') {
        status = "Not Confirmed"
        tryMessageUpdate(status, uuid)
          .then(message => {
            console.log(err, "TIMEOUT ERROR")
            res.status(500).json({ status: "INTERNAL SERVER ERROR: TIMEOUT" })
            return;
          })
          .catch(() => {
            console.log("STORAGE ERROR")
            res.status(500).json({ data: "STORAGE ERROR 2, TRY AGAIN" })
            return;
          })

      } else {
        status = "Failed";
        tryMessageUpdate(status, uuid)
          .then(message => {
            console.log(err, "INTERNAL SERVER ERROR")
            res.status(500).json({ status: "INTERNAL SERVER ERROR" })
            return;
          })
          .catch(() => {
            console.log("STORAGE ERROR")
            res.status(500).json({ data: "STORAGE ERROR 3, TRY AGAIN" })
            return;
          })
      }
    })
}

router.post('/', apiLimiter, validator(), (req, res, next) => {
  
  let {destination, body} = req.body
  let status = "Not Processed";
  let uuid = uuidv1();
  dbService.enqueue(uuid);
  console.log("ENQUEUED", dbService.queue)
  
    tryMessageCreate(destination, body, status, uuid)
    .then((message)=>{
      console.log("mssgCreate", message)
    })
    .catch(e => {
      res.status(500).json({data: "STORAGE ERROR 0, TRY AGAIN"})
      return;
    })

    dbService.getCredit().then(credit =>{
      console.log("CREDIT:",  credit);

      if (credit.amount >= price) {
        if ( dbService.queue.length > 0 && !dbService.lock) {
          console.log("IF NO LOCK", dbService.lock, dbService.queue);
          dbService.lock = true;
            
          postMessage(destination, body, uuid, status, res)
        }

      } else {
        console.log("NO CREDIT")
        res.status(400).json({status: "UNABLE TO SEND MESSAGE: NO CREDIT"})
        return;
      } 
    }) 
})

module.exports = router;