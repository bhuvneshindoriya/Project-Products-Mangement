



const userModel= require("../model/userModel");







exports.getUser=async function(req,res){
    try{
     const userId=req.params.userId
  
     if (!isValidObjectId(userId)) return res.status(400).send({status : false , message : "invalid userId"})
  
     if (req.decode.userId!==userId) return res.status(403).send({status : false , message : "not authorised"})
  
     const userIs=await userModel.findById({userId})

     if (!userIs) return res.status(404).send({status : false , message : "no user present with this id"})
  
     if (userIs.isDeleted===true) return res.status(400).send({status : false , message : "user is already deleted"})
  
     return res.status(200).send({status : true ,message: "User profile details", data : userIs})
  
      }catch(error){
        return res.status(500).send({status:false , message : error.message})
      }
  }
  