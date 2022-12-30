
const aws = require("aws-sdk");

exports.uploadFile = async (file) => {
  aws.config.update({
    accessKeyId: "AKIAY3L35MCRZNIRGT6N",
    secretAccessKey: "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",
    region: "ap-south-1",
  });

  let s3 = new aws.S3({ apiVersion: "2006-03-01" });

  var uploadParams = {
    ACL: "public-read",
    Bucket: "classroom-training-bucket",
    Key: "abc/" + file.originalname,
    Body: file.buffer,
  };

  try {
    const data =  s3.upload(uploadParams);
    console.log("file uploaded succesfully");
    return data.Location;
  } catch (error) {
    return { error };
  }
};
const cartModel = require('../model/cartModel')
const {isValidObjectId}= require('../util/validator')
exports.deleteCart = async function(req,res){
    try{
        const userId = req.params.userId
        if(!isValidObjectId(userId)) return res.status(400).send({status:false,messsage:`This userId ${userId} is not valid.please provide valid userId`})
        if(req.decode.userId!=userId) return res.status(403).send({status:false,messsage :"You are not authorized"})
        const deleteCart = await cartModel.findOneAndUpdate({userId:userId},{$set:{items:[],totalItems:0,totalPrice:0}},{new:true})
        if(!deleteCart) return res.status(404).send({status:false,message:`This ${userId} userId is not found in cart`})
        return res.status(204).send()

    }catch(err){
        return res.status(500).send({status:false,message:err.message})
    }
}
