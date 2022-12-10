const getVisualCenter = require('visual-center');
const bodyParser = require('body-parser')
const express = require('express');

const b64 = require("base64-image-utils");

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

const getMathCenter = (matrix) => {
    let left,top,right,bottom;
    for(let i=0;i<matrix.length;i++) {if (top!=undefined) break;for(let j=0;j<matrix[i].length;j++) if(matrix[i][j].a > 0) {top = i;break;}};
    for(let i=matrix.length-1;i>=0;i--) {if (bottom!=undefined) break;for(let j=0;j<matrix[i].length;j++) if(matrix[i][j].a > 0) {bottom = matrix.length-1-i;break;}};
    for(let j=0;j<matrix[0].length;j++) {if (left!=undefined) break;for(let i=0;i<matrix.length;i++) if(matrix[i][j].a > 0) {left = j;break;}};
    for(let j=matrix[0].length-1;j>=0;j--) {if (right!=undefined) break;for(let i=0;i<matrix.length;i++) if(matrix[i][j].a > 0) {right = matrix[0].length-1-j;break;}};
    return {left:left,right:right,top:top,bottom:bottom};
}


app.post("/upload", (req, res) => {
    isProcesssing = true;
    const image = req.body.imageUpload;
    getVisualCenter(image, (err, res) => {
        if(err) return console.error(err);
        isProcesssing = false;
        b64.base64ImageToRGBMatrix(image, (err,matrix) => {
            processResult = res;
            processResult.mathCenter = getMathCenter(matrix);
            processResult.imageName = req.body.imageUploadName;
            processResult.image = image;
        });

    });
    fs.readFile(path.join(__dirname,"/public/res.html"), "utf-8", (err,html) => {
        if(err) {console.error(err);return;}
        res.send(html);
    });
});

app.listen(2560, ()=>console.log("go to http://localhost:2560 to upload images"));