const cartModel = require('../model/cartModel')
const productModel = require('../model/productModel')
const userModel=require('../model/userModel')
const {isValidObjectId,}=require('../util/validator')

// ------create-cart------
exports.createCart = async function (req, res) {
  try {
      let userId = req.params.userId;
      let data = req.body;
      let { productId, cartId, quantity } = data;
      if (!quantity) {
          quantity = 1
      }
      if(!isValidObjectId(productId)) return res.status(400).send(({status:false , message:"Please provide valid product Id"}))

      if(!isValidObjectId(userId)) return res.status(400).send(({status:false , message:"Please provide valid user Id"}))
      let ProductData = await productModel.findOne({ _id: productId })
      if (ProductData == null) {
          return res.status(400).send({ status: false, message: "productId is not correct" })
      }
      let price = ProductData.price

      let cartData = await cartModel.findOne({ userId: userId })

      if (cartData == null) {

          let data = {
              userId: userId,
              items: [{ productId: productId, quantity: quantity }],
              totalPrice: (price * quantity).toFixed(2),
              totalItems: 1,
          }

          let createCart = await cartModel.create(data)
          res.status(201).send({ status: true,message:"Success", data: createCart })
      }


      else {

          let items = cartData.items
          let totalPrice = cartData.totalPrice
          let totalItems= cartData.totalItems


          let flag = 0;
          // let NewQuantity = 0;
          for (let i = 0; i < items.length; i++) {
              if (items[i].productId == productId) {
                  items[i].quantity += quantity
                  // NewQuantity = items[i].quantity
                  flag = 1
              }
          }
          if (flag == 1) {
              price = (quantity * price) + totalPrice
              let data = {
                  totalPrice: price,
                  items: items,
                  totalItems:items.length
              }
              let updateCart = await cartModel.findOneAndUpdate({ userId: userId }, { $set: data }, { new: true })
              return res.status(201).send({ status: true,message:"Success",data: updateCart })
          } else if (flag == 0) {
              items.push({ productId: productId, quantity: quantity })
              price = (price * quantity) + totalPrice
              totalItems= totalItems + 1
              let data = {
                  items: items,
                  totalPrice: price,
                  totalItems:totalItems

              }
              let updateCart = await cartModel.findOneAndUpdate({ userId: userId }, { $set: data }, { new: true })
              return res.status(201).send({ status: true,message:"Success", data: updateCart })

          }
      }

  }
  catch (err) {
      return res.status(500).send({ status: false, message: err.message })
  }
}

// -------update-cart------
  exports.updateCart = async function (req, res) {
    try {
      //request userId from path params
      const userId = req.params.userId;
      if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: "Please provide valid User Id!" });  
  
      //Destructuring
      const { cartId, productId, removeProduct } = req.body
  
      //request body validation => request body must not be empty
  
  
      // CartId Validation => cardId is mandatory
 
      if (!isValidObjectId(cartId)) return res.status(400).send({ status: false, message: "Please enter valid cartId!" })
  
      //DB call => find cart from carttModel by cartId
      let cart = await cartModel.findOne( {userId : userId} )
      //cart not found in DB
      if (!cart) { return res.status(400).send({ status: false, message: "Cart does not exist in the DB! " }) }
      //cart is blank
      if (cart.items.length == 0) { return res.status(400).send({ status: false, message: "Nothing left to update!" }) }
  
      //productId validation => productId is mandatory
   
      if (!isValidObjectId(productId)) return res.status(400).send({ status: false, message: "Please enter valid productId!" })
      //DB call => find product from productModel by productId
      let product = await productModel.findOne({ _id: productId, isDeleted: false })
      //product not found in the DB
      if (!product) { return res.status(404).send({ status: false, message: "Product not found!" }) }
  
      //remove product validation => remove product must be 0 or 1
      if (!(removeProduct == 1 || removeProduct == 0)) {
        return res.status(400).send({ status: false, message: "please mention 1 or 0 only in remove product" })
      }
  
      //declare variables
      let cartItems
      let productQuantity
      let productItems
      let allPrice
      let allItems
  
      //if removeProduct equal to 1
      if (removeProduct == 1) {
        cartItems = cart.items
        // array of items
        for (let i = 0; i < cartItems.length; i++) {
          if (cartItems[i].productId == productId) {
            // decreasing quantity of product -1
            productQuantity = cartItems[i].quantity - 1
            cartItems[i].quantity = productQuantity
            // updated total price after remove the product from cart
            allPrice = cart.totalPrice - product.price;
  
            if (cartItems[i].quantity == 0) {
              cartItems.splice(i, 1)
              //decrease the product count on successfull remove product
              // only  if item quantity will become zero, totalItems will -1
              productItems = cart.totalItems - 1
              allItems = productItems
            }
            break;
          }
        }
        // if there will be no item in cart 
        if (cartItems.length == 0) { allPrice = 0; allItems = 0 };
  
        //DB call and Update => update product details by requested body parameters 
        let updatedProduct = await cartModel.findByIdAndUpdate({ _id: cartId }, { items: cartItems, totalPrice: allPrice, totalItems: allItems }, { new: true })
        //Successfull upadate products in cart details return response to body
        return res.status(200).send({ status: true, message: "Success", data: updatedProduct })
  
      }
  
      //if removeProduct equal to 0
      if (removeProduct == 0) {
        cartItems = cart.items
        // array of items
        for (let i = 0; i < cartItems.length; i++) {
          if (cartItems[i].productId == productId) {
            //deducting products price from total price
            allPrice = cart.totalPrice - (product.price * cartItems[i].quantity)
            // decreasing totalItems quantity by 1     
            allItems = cart.totalItems - 1
            // deleting product from items array            
            cartItems.splice(i, 1)
            break;
          }
        }
  
      }
      // if items array will become empty
      if (cartItems.length == 0) { allPrice = 0; allItems = 0 };
      //DB call and Update => update product details by requested body parameters         
      let updatedProduct = await cartModel.findByIdAndUpdate({ _id: cartId }, { items: cartItems, totalPrice: allPrice, totalItems: allItems }, { new: true })                                                         // updated
      //Successfull upadate products in cart details return response to body
      return res.status(200).send({ status: true, message: "Success", data: updatedProduct })
    }
    catch (err) {
      console.log(err)
      return res.status(500).send({ status: false,  message: err.message })
    }
  }


// ------get-cart------
exports.getCart= async function(req,res){
  try{
      const userId=req.params.userId;

      if (!isValidObjectId(userId)) return res.status(400).send({status : false , message : "invalid userId"})
      // ----authorisation-----
      if ( userId !=req.decode.userId)  return res.status(403).send({ status: false, message: "you are not Athorised" });

      const userData = await cartModel.find({userId:userId})
      if(!userData) return res.status(404).send({status:false, message:"user not exist"})

        return res.status(200).send({status:true, message:"Success",data:userData})
    }
catch(err){      
       return res.status(500).send({status:false,message:err.message})
   }
}

// ------delete-cart------
exports.deleteCart= async function(req,res){
  try{
      const userId=req.params.userId;
     
      if (!isValidObjectId(userId)) return res.status(400).send({status : false , message : "invalid userId"})
      
     if (req.decode.userId!=userId) return res.status(403).send({status : false , message : "you are not authorised"})

      const updateData = await cartModel.findOneAndUpdate({ userId: userId }, { $set: { items: [], totalItems: 0, totalPrice: 0 }}, { new: true })

      if(!updateData) return res.status(404).send({status:false, message:"user not exist"})

      return res.status(204).send()
  }
catch(err){     
          return res.status(500).send({status:false,message:err.message})
 }

}
