const jwt = require('jsonwebtoken');

const userModel= require("../model/userModel");


//________________________________________Authentication_______________________________________________________________

exports.authenticate = (req, res, next) => {
    try{
          let token = req.headers["x-api-key"];

          if (!token) return res.status(400).send({ status: false, msg: "token must be present" });

          jwt.verify(token, "Group-13", function (err, decode) {
          if (err) { return res.status(401).send({ status: false, data: "Token is not Valid !!!" }) }
          req.decode = decode;
          return  next();

      })

    }
          catch (error) {
          res.status(500).send({ staus: false, msg: error.message });
    }
}

//______________________________________________Authorization______________________________________________________________

exports.authorize= async function ( req, res, next) {
    try{
          let userId= req.params.userId
          let gettingUserId= await userModel.findById({userId})
          let getUser= gettingUserId.userId.toString()

          if ( getUser !== req.decode.userId)  return res.status(403).send({ status: false, msg: "you are not Athorised" });

            return next();   
        }
          catch(error){
          return res.status(500).send({msg: error.message})
     }
  }


