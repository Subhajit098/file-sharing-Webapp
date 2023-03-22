"use strict";
require("dotenv").config();
const express=require("express");
const mongoose=require("mongoose");
const multer=require("multer");
const ejs=require("ejs");
const bcrypt=require("bcrypt");
const File=require("./models/file");


const app = express();
app.use(express.urlencoded({ extended:true }));

let currentPassword="";

const upload=multer({ dest: "uploads"});

app.set("view engine","ejs");
 
mongoose.connect(process.env.DATABASE_URL);
mongoose.set('strictQuery', true); // optional

app.get("/",(req,res)=>{
    res.render("index");
})


app.post("/upload", upload.single("file"),async(req,res)=>{
    const fileData={
        path:req.file.path,
        originalName:req.file.originalname
    }
    if(req.body.password!=null && req.body.password!="")
    {
        fileData.password = await bcrypt.hash(req.body.password,10);  // adding the password property to the fileData
    }

    const file=await File.create(fileData);
    // file.save();

    res.render("index",{ fileLink: `${req.headers.origin}/file/${file.id}` }); 
})

let result_2={};

async function handleDownload(req,res){

    const foundFile=await File.findById(req.params.id);

    if(foundFile.password!=null){
        if(req.body.password==null){
            res.render("password");
            return;
        }

        if(!(await bcrypt.compare(req.body.password,foundFile.password))){
            res.render("password",{error:true});
            return;
        }
    }

    foundFile.downloadCount++;
    await foundFile.save();
    console.log(foundFile.downloadCount);
    res.download(foundFile.path,foundFile.originalName);
}

app.get("/file/:id",handleDownload);


app.post("/file/:id",handleDownload);


/*
console.log("Hello");
   if(!(await bcrypt.compare(req.body.password,currentPassword)))
   {
        res.render("password",{error:true});
        return;
   }
        result_2.downloadCount++;
        result_2.save();
        console.log(result_2.downloadCount);
        res.download(result_2.path,result_2.originalName);
     

        
        // if( !(async bcrypt.compare(req.body.password,

*/

app.listen(process.env.PORT,()=>{
    console.log("server started at port 3000");
});