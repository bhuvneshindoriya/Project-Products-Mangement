const cartModel = require('../model/cartModel')
const userModel = require('../model/userModel')
const orderModel = require('../model/orderModel')
const {isValidEmail,isValidObjectId,isValidphone,isValidBody,isValidRequestBody,isValidName,isValidpassword,isValidCity,isValidPinCode,isValidProductName,isValidPrice,isValidateSize,isValidNo,isValidImage}=require('../util/validator')

exports.createOrder = async function (req, res) {
    try {
      //request userId from path params
      const { userId } = req.params
      //userId must be a valid objectId
      if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: "Please provide valid User Id!" });
  
      // Destructuring
      const { cartId, status, cancellable } = req.body
      //request body must not be empty
     /////////
      //cartId validation => cartId is mandatory and must not be empty
      ////////////
      //cartId must be a valid objectId
      if (!isValidObjectId(cartId)) return res.status(400).send({ status: false, message: "Please provide valid cartId!" });
  
      //DB call => find cart details from cartModel by userId and cartId
      const cartItems = await cartModel.findOne({ _id: cartId, userId: userId, isDeleted: false })
      //userId not present in the DB
      if (cartItems.userId != userId) return res.status(404).send({ status: false, message: `${userId} is not present in the DB!` });
      // cart not present in the DB or empty
      if (!cartItems) return res.status(400).send({ status: false, message: "Either cart is empty or does not exist!" });
  
      //products quantity update
      let items = cartItems.items
      let totalQuantity = 0
      for (let i = 0; i < items.length; i++) {
        totalQuantity += items[i].quantity
      }
      console.log(totalQuantity);
      // cancellable validation => if key is present value must not be empty
      if (cancellable) {
        //cancellable must be true or false
        if (cancellable !== true || false) {
          return res.status(400).send({ status: false, message: "Cancellable can be either true or false!" });
        }
      }
  
      // status validation => if key is present value must not be empty
      if (status) {
        //status must be pending or completed or canceled
        if (status !== "pending" || "completed" || "cancled") {
          return res.status(400).send({ status: false, message: "Status can be either pending or completed or cancled!" });
        }
      }
  
      // Destructuring
      let order = { userId: userId, items: cartItems.items, totalPrice: cartItems.totalPrice, totalItems: cartItems.totalItems, totalQuantity: totalQuantity, cancellable: cancellable, status: status }
  
      //Create order for the user and store in DB
      let orderCreation = await orderModel.create(order)
      //update cart on successfully complition of order and set cart as empty
      await cartModel.findOneAndUpdate({ userId: userId, isDeleted: false }, { $set: { items: [], totalPrice: 0, totalItems: 0 } })
      //Successfull oreder details return response to body
      return res.status(201).send({ status: true, message: `Order created successfully`, data: orderCreation });
    }
    catch (error) {
      res.status(500).send({ status: false, message: error.message });
    }
  }