const getVisualCenter = require('visual-center');
const bodyParser = require('body-parser')
const express = require('express');

const fs = require("fs");
const path = require("path");
const app = express();

let isProcesssing = true;
let processResult = null;

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false, limit:'100mb' }))

app.get("/", (req,res) => {
    fs.readFile(path.join(__dirname,"/public/index.html"), "utf-8", (err,html) => {
        if(err) {console.error(err);return;}
        res.send(html);
    });
});

app.get("/getResult", (req,res) => {
    if(isProcesssing) res.send(JSON.stringify({"status":"progress"}));
    else res.send(JSON.stringify({"status":"complete","res":processResult}));
})


app.post("/upload", (req, res) => {
    isProcesssing = true;
    const image = req.body.imageUpload;
    getVisualCenter(image, (err, res) => {
        if(err) return console.error(err);
        isProcesssing = false;
        
        processResult = res;
        processResult.imageName = req.body.imageUploadName;
        processResult.image = image;
    });
    fs.readFile(path.join(__dirname,"/public/res.html"), "utf-8", (err,html) => {
        if(err) {console.error(err);return;}
        res.send(html);
    });
});

app.listen(2560, ()=>console.log("go to http://localhost:2560 to upload images"));