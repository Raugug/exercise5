require('dotenv').config();

var express = require('express');
const bodyParser = require('body-parser');
var app = express();
const mongoose = require('mongoose');
const dbService = require('./dbService/dbService');
DBURL = 'mongodb://mongodb:27017/messages';
//DBURL = 'mongodb://localhost:27017/messages';
DBURL2 = 'mongodb://mongodb2:27017/messages2';
//DBURL2 = 'mongodb://localhost:27018/messages2';
const DB1 = dbService.connect(DBURL);
const DB2 = dbService.connect(DBURL2);




app.use(bodyParser.urlencoded({ limit: '1mb', extended: false }))
app.use(bodyParser.json({ limit: '1mb' }))
app.use((err, req, res, next) =>{  
  if (err instanceof SyntaxError) {
    res.status(400).json({status: "INVALID JSON FORMAT"})
  } else if (err) {
    res.status(500).json({status: "SERVER ERROR"})  
  } else {
    next();
  }
})
  
DB1.on('disconnected', () => {dbService.switchMain(DB1)})
DB1.on('connected', () => {
  console.log("DB1 connected");
   if(dbService.second.db!==null){console.log("second", dbService.second.db.name)}})
DB2.on('disconnected', () => {dbService.switchMain(DB2)})
DB2.on('connected', () => {
  console.log("DB2 connected:");
  if(dbService.second.db!==null){console.log("second", dbService.second.db.name)}
                          
})


const messageRoutes = require('./routes/messages');
app.use('/message', messageRoutes);
const creditRoutes = require('./routes/credit');
app.use('/credit', creditRoutes);

app.listen(9001, function () {
  console.log('Server listening on port 9001');
});