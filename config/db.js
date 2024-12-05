const mongoose=require('mongoose')

const connect=async ()=>{
    try{
        const conn=await mongoose.connect(process.env.DBI_URI);
        console.log("Database Connected")
    }catch (error) {
        console.log(`Error: ${error.message}`);
        process.exit();
      }
}

module.exports=connect;