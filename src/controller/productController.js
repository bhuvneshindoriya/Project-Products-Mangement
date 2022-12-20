const productModel = require('../model/productModel')
const aws = require('../aws/S3')
const{isValidRequestBody,isValidName,isValidNo,isValidateSize}=require('../util/validator')
const userModel = require('../model/userModel')
const {isValidObjectId}=require('mongoose')

// ======> create product <======
exports.createProduct= async function(req,res){
    let body = req.body
    if(!isValidRequestBody(req.body)) return res.status(400).json({status:false,message:"requesbody must be present"})
    const{title,description,price,availableSizes,installments}=body

    if(!description) return res.status(400).json({status:false,message:"description must be present"})
    if(!isValidName(description)) return res.status(400).json({status:false,message:"please only use a-z & A-Z alphabates"})

    if(!price) return res.status(400).json({status:false,message:"price must be present"})
    if(!isValidNo(price)) return res.status(400).json({status:false,message:"please use only numbers(0-9)"})

    if(!availableSizes) return res.status(400).json({status:false,message:"availablesizes must be present"})
    if(!isValidateSize(availableSizes)) return res.status(400).json({status:false,message:"only use[S, XS, M, X, L, XXL, XL]"})

    if(!isValidNo(installments)) return res.status(400).json({status:false,message:"use only numbers[0-9]"})
    // ------title validation-----
    if(!title) return res.status(400).json({status:false,message:"title must be present"})
    if(!isValidName(title)) return res.status(400).json({status:false,message:"please only use a-z & A-Z alphabates"})
    const checktitle=await productModel.findOne({title})
    if(checktitle) return res.status(400).json({status:false,message:"title is already present"})
    // ------create aws-s3 link-----
    let files= req.files

        if(files && files.length>0){    
        body.productImage= await aws.uploadFile( files[0] )
        }
        else{
            res.status(400).send({ msg: "productimage must be present" })
        } 
    let createUser = await productModel.create(body)
    return res.status(201).send({status:true,data:createUser})
}

// ====> get product by product id (params) <=====
exports.getProduct=async function(req,res){
    try{
      const productId=req.params.productId
       
     if (!isValidObjectId(productId)) return res.status(400).send({status : false , message : "please provide valid product id"})

      const productData=await productModel.findOne({_id:productId,isDeleted:false})

      if (!productData) return res.status(404).send({status : false , message : "product not exist in db"})

      return res.status(200).send({status : true ,message: "product profile details", data : productData})
      
    }catch(error){
        return res.status(500).send({status:false , message : error.message})
      }
}
