const express = require("express");
const router = express.Router();


router.get('/test-me', function(req,res){
    res.send({msg: "done"})
})

router.post('/login',userLogin)
router.get("/user/:userId/profile", Authentication, getUser)
router.put("/user/:userId/profile", Authentication, Authorization, userUpdate)


module.exports = router;