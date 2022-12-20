const express = require("express");
const router = express.Router();
const {createUser,userLogin,getUser,userUpdate}=require("../controller/userController")
const {authenticate,authorize}=require('../middileWare/auth')

router.get('/test-me', function(req,res){
    res.send({msg: "done"})
})
router.post('/register',createUser)
router.post('/login',userLogin)
router.get("/user/:userId/profile",authenticate,getUser)
router.put("/user/:userId/profile",authenticate ,authorize, userUpdate)


module.exports = router;