const productModel = require('../model/productModel')
const aws = require('../aws/S3')

exports.createProduct= async function(req,res){
    let body = req.body
    let files= req.files
        if(files && files.length>0){
            
        body.productImage= await aws.uploadFile( files[0] )
        }
        else{
            res.status(400).send({ msg: "No file found" })
        } 
    let createUser = await productModel.create(body)
    return res.status(201).send({status:true,data:createUser})
}

exports.getProduct=async function(req,res){
    try{
      const productId=req.params.productId
       
     // if (!isValidObjectId(productId)) return res.status(400).send({status : false , message : "invalid productId"})

      const productData=await productModel.findById({_id:productId})

      if (!productData) return res.status(404).send({status : false , message : "no product present with this id"})
  
      if (productData.isDeleted===true) return res.status(400).send({status : false , message : "product is already deleted"})
   
      return res.status(200).send({status : true ,message: "product profile details", data : productData})
      
    }catch(error){
        return res.status(500).send({status:false , message : error.message})
      }
}
