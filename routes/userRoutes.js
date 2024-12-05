const express=require('express')
const {register,login,logout}=require('../controllers/User')
const {registerValidation,handleValidationErrors}=require('../validation/registerValidators')
const router=express.Router()


router.route('/').post(registerValidation, handleValidationErrors,register)
router.route('/login').post(login)
router.route('/logout').post(logout)


module.exports=router;