const express=require('express')
const app=express()
const userRoutes=require('./routes/userRoutes')
const errorMiddleware = require('./middlewares/errorMiddlewares');
const db=require('./config/db')
const dotenv=require('dotenv');

dotenv.config()
db();

app.use(errorMiddleware);
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use('/user',userRoutes)
const { protect } = require("./middlewares/authMiddleware");
app.get('/',protect,(req,res)=>{
    res.send("hello world")
})
app.listen(3000,()=>{
    console.log("Server Running: http://localhost:3000/")
})