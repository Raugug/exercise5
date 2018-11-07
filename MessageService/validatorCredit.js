const validator = () => {
    return (req, res, next) => {
  
      let {amount} = req.body;

      if (!req.body.amount) {
        console.log("amount key required to send a message")
        res.status(400).json({status: "amount key required to send a message"})
        return;
      }
  
  
      if (typeof req.body !== "object"){
        res.status(400). json({status: "OBJECT EXPECTED BY SERVICE"})
        return;
      }
      else if(amount === undefined) {
        console.log("amount can't be undefined")
        res.status(400).json({status: "amount can't be undefined"})
        return
      }
      else if(!amount) {
        console.log("amount not provided")
        res.status(400).json({status: "amount not provided"})
        return;
      }
      else if (typeof amount !== "number"){
        console.log("amount must be a number")
        res.status(400).json({status: "amount must be a number"})
        return;
      }
      else if (amount.length == 0) {
        console.log("field must be filled")
        res.status(400).json({status: "all fields must be filled"})
        return;
      }
      else if (amount <= 0) {
        console.log("amount must be a positive number")
        res.status(400).json({status: "amount must be a positive number"})
        return;
      }
      next()
    }
  }

  module.exports = validator;