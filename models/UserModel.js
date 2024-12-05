const mongoose=require('mongoose')
const bcrypt = require("bcrypt");
const userSchema=mongoose.Schema({
    name:String,
    userName:String,
    email:String,
    password:String,
    
}
)
userSchema.methods.matchPassword = async function (enteredPassword) {
    // 'this' refers to the current document (the user object)
    return await bcrypt.compare(enteredPassword, this.password);
};
module.exports=mongoose.model('user',userSchema)
