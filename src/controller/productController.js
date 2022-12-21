const productModel = require('../model/productModel')
const aws = require('../aws/S3')
const validator= require('../util/validator')
//const { isValidObjectId } = require('mongoose')
const {isValidEmail,isValidObjectId,isValidphone,isValidBody,isValidRequestBody,isValidName,isValidpassword,isValidCity,isValidPinCode,isValidProductName,isValidPrice,isValidateSize,isValidInstallment,isValidImage}=require('../util/validator')
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

exports.getProductByQuery = async function(req,res) {

    try {

        let data = req.query

 
        let { size, name, priceGreaterThan, priceLessThan, priceSort} = data

        let obj = { isDeleted: false }

      
        if (size) {
            if (!validator.isValidBody(size)) return res.status(400).send({ status: false, message: "Please enter Size" });
            obj.availableSizes = size 
        }

        if (name) {
            if (!validator.isValidBody(name)) { return res.status(400).send({ status: false, message: "Please enter name" }) }
            if (!validator.isValidProductName(name)) { return res.status(400).send({ status: false, message: "Please mention valid name" }) }
            obj.title =  name 
        }


        if (priceGreaterThan) {
            if (!validator.isValidBody(priceGreaterThan)) return res.status(400).send({ status: false, message: "Please enter Price Greater Than" });
            if (!validator.isValidPrice(priceGreaterThan)) return res.status(400).send({ status: false, message: "priceGreaterThan must be number" });
            obj.price = { $gt: priceGreaterThan }
        }

      
        if (priceLessThan) {
            if (!validator.isValidBody(priceLessThan)) return res.status(400).send({ status: false, message: "Please enter Price Lesser Than" });
            if (!validator.isValidPrice(priceLessThan)) return res.status(400).send({ status: false, message: "priceLessThan must be number" });
            obj.price = { $lt: priceLessThan }
        }

        if (priceGreaterThan && priceLessThan) {
            obj.price = { $gt: priceGreaterThan, $lt: priceLessThan }
        }

      
        if (priceSort) {
            if (!(priceSort == -1 || priceSort == 1)) return res.status(400).send({ status: false, message: "Please Enter '1' for Sort in Ascending Order or '-1' for Sort in Descending Order" });
        }

    
        let getProduct = await productModel.find(obj).sort({ price: priceSort })

   
        if (getProduct.length == 0) return res.status(404).send({ status: false, message: "Product Not Found." })

        return res.status(200).send({ status: true, message: "Success", data: getProduct })

    } catch (error) {

        return res.status(500).send({ status: false, message: error.message })
    }
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


exports.updateProduct= async function(req,res){
 try {  let body = req.body
    let productId = req.params.productId
    let files = req.files
    let { title, description, price, isFreeShipping, style, availableSizes, installments, productImage } =body
   //if(!isValidRequestBody(body)) return res.status(400).send({status:false,message:"Please enter atleast one update"})
    if(!isValidObjectId(productId)) return res.status(400).send({status:false,message:"Please enter valid productId in params"})
    let obj = {}
    if(title){
        let checkTitle =  await productModel.findOne({title:title})
        if(checkTitle) return res.status(400).send({status:false,message:"Please provide another title"})
        obj.title= title
    }
    if(description){
        obj.description= description
    }
    if(price){
        obj.price=price
    }
    if(isFreeShipping){
        obj.isFreeShipping=isFreeShipping
    }
    if(style){
        obj.style=style
    }
    if(availableSizes){
        obj.availableSizes=availableSizes
    }
    if(installments){
        obj.installments=installments
    }
    if(productImage){
        let uploadedFile = await aws.uploadFile(files[0])
        obj.productImage=uploadedFile
    }
    let productUpdate = await productModel.findOneAndUpdate({isDeleted:false,_id:productId},{$set:obj},{new:true})
    if(!productUpdate) return res.status(404).send({status:false,message:"product not found"})
    return res.status(200).send(({status:true,data:productUpdate}))
}catch(error){
    return res.status(500).send({status:false,message:error.message})
}
}

