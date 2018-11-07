const validator = () => {
    return (req, res, next) => {
  
      if (!req.body.destination) {
        console.log("destination key required to send a message")
        res.status(400).json({status: "Destination key required to send a message"})
        return;
      }
      else if (!req.body.body) {
        console.log("body key required to send a message")
        res.status(400).json({status: "body key required to send a message"})
        return;
      }
  
      let {destination, body} = req.body;
  
      if (typeof req.body !== "object"){
        res.status(400). json({status: "OBJECT EXPECTED BY SERVICE"})
        return;
      }
      else if(destination === undefined) {
        console.log("Message can't be sent to undefined")
        res.status(400).json({status: "Message can't be sent to undefined"})
        return
      }
      else if(body === undefined) {
        console.log("Message body can't be undefined")
        res.status(400).json({status: "Message body can't be undefined"})
        return
      }
      else if(!destination || !body) {
        console.log("body or destination not provided")
        res.status(400).json({status: "body or destination not provided"})
        return;
      }
      else if (typeof destination !== "string" || typeof body !== "string"){
        console.log("incorrect type of parameters")
        res.status(400).json({status: "body and destination must be strings"})
        return;
      }
      else if (destination.length == 0 || body.length == 0) {
        console.log("fields must be filled")
        res.status(400).json({status: "all fields must be filled"})
        return;
      }
      else if (destination.length > 100) {
        console.log("Destination field exceeded max length")
        res.status(400).json({status: "destination length excedeed"})
        return;
      }
      else if (body.length > 200) {
        console.log("Body field exceeded max length")
        res.status(400).json({status: "body length exceeded"})
        return;
      }
      next()
    }
  }

  module.exports = validator;