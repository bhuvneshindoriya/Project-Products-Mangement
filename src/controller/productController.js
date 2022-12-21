const productModel = require('../model/productModel')
const aws = require('../aws/S3')

const validator= require('../util/validator')
//const { isValidObjectId } = require('mongoose')
const {isValidEmail,isValidObjectId,isValidphone,isValidBody,isValidRequestBody,isValidName,isValidpassword,isValidCity,isValidPinCode,isValidProductName,isValidPrice,isValidateSize,isValidNo,isValidImage}=require('../util/validator')


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

