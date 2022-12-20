
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const userModel= require("../model/userModel");
const aws=require('../aws/S3')




exports.createUser=async (req,res)=>{
    try{
        const reqBody=req.body
        //console.log(reqBody.address)
        const{password,address}=req.body
        reqBody.address=JSON.parse(address)
        
       
        console.log(reqBody)
        let files= req.files
        if(files && files.length>0){
            
        reqBody.profileImage= await aws.uploadFile( files[0] )
        }
        else{
            res.status(400).send({ msg: "No file found" })
        } 
        reqBody.password=await bcrypt.hash(password,4) 
        
        const createdata=await userModel.create(reqBody)
       return res.status(201).json({status:true,message:'User created successfully',data:createdata})
    }catch(error){
        return res.status(500).json({error:error.message})
    }
}


exports.userLogin = async function(req,res){
  try{   let body = req.body
      let {email,password}= body
      if(!email) return res.status(400).send({status:false,message:"email is required"})
      if(!password)return res.status(400).send({status:false,message:"password is required"})
      let checkEmail = await userModel.findOne({email :email})
      if(!checkEmail) return res.status(404).send({status:false,message:"email is not reg."})
      let checkPassword = await bcrypt.compare(password,checkEmail.password)
      if(!checkPassword) return res.status(400).send({status:false,message:"Password is not correct"})
      else{
          const token = jwt.sign({userId:checkEmail._id},"Group-13")
          let obj = {
              userId:checkEmail._id,
              token : token
          }
          return res.status(200).send({status:true,message: "User login successfull",data:obj})
      }}catch(err){
      return res.status(500).json({status:false,message:err.message})
  }}
  


exports.getUser=async function(req,res){
    try{
     const userId=req.params.userId
  
    //  if (!isValidObjectId(userId)) return res.status(400).send({status : false , message : "invalid userId"})
  
     if (req.decode.userId!=userId) return res.status(403).send({status : false , message : "not authorised"})
  
     const userIs=await userModel.findById({_id:userId})

     if (!userIs) return res.status(404).send({status : false , message : "no user present with this id"})  
     return res.status(200).send({status : true ,message: "User profile details", data : userIs})
  
      }catch(error){
        return res.status(500).send({status:false , message : error.message})
      }
  }
  
  exports.userUpdate = async function(req,res){
    try{
        let body = req.body
        let userId =  req.params.userId
        if(!body) return res.status(400).send({status:false,message:"Body is required"})
        
        let findUser = await userModel.findOneAndUpdate({_id:userId},{$set:body},{new:true})
        if(!findUser)  return res.status(404).send({status:false,message:"UserId is not found"})
        return res.status(200).send({status:true,message:"User profile updated",data:findUser})
    }catch(err){
        return res.status(500).send({status:false,message:err.message})
    }
}
