const express = require("express");
const router = express.Router();
const {createUser,userLogin,getUser,userUpdate}=require("../controller/userController")
const {createProduct, getProduct, getProductByQuery, updateProduct}= require('../controller/productController')
const {authenticate,authorize}=require('../middileWare/auth')

router.get('/test-me', function(req,res){
    res.send({msg: "done"})
})
router.post('/register',createUser)
router.post('/login',userLogin)
router.get("/user/:userId/profile",authenticate,getUser)
router.put("/user/:userId/profile",authenticate ,authorize, userUpdate)


//**Poduct**
router.post('/products',createProduct)
router.get('/products',getProductByQuery)
router.get('/products/:productId',getProduct)
router.put('/products/:productId',updateProduct)


module.exports = router;