import express from 'express';
import multer from 'multer';
import { scImgUpload, s3Download } from '../helpers/aws.js';
//import path from 'path';
import invoiceController  from '../controller/invoice/index.js';
import invoiceValidator  from '../validators/invoiceValidator.js';
import { verifyToken } from '../middlewares/userAuth.js';

const router = express.Router();

const singleUpload = scImgUpload.single("bugAttachmentsUrl");

//For localy storing uploaded images starts.....

// var storage = multer.diskStorage({
//     //here we can set the image upload folder path 
//     //this path will be within the node project folder (like server/uploads/qrcodes/)
//     destination: function (req, file, cb) {
//      cb(null, 'uploads/qrcodes/')
//     },
//     // By default, multer removes file extensions so let's add them back
//     filename: function (req, file, cb) {
//         //file.originalname will show the original image name
//       //path.extname(file.originalname) will get the extension of the file
//       //here any type of file saved in png format
//       cb(null, req.user.userId + '.png') 
//    } });
//   var upload = multer({ storage: storage });

//router.post('/generate-qrcode', verifyToken(), upload.single('bugAttachmentsUrl'), qrcodeController.generateQrcode);

//For localy storing uploaded images ends.....


router.get('/getInvoicesList', verifyToken(), invoiceController.getInvoicesList);
//router.get("/exportServicecall", verifyToken(), servicecallController.exportServicecall);
//router.post("/addServicecall",[[multer().single("bugAttachments")], verifyToken()], servicecallController.addServicecall);
router.post("/addInvoice",verifyToken(), invoiceController.addInvoice);
//router.post("/addInvoice",verifyToken(), invoiceValidator.addInvoiceValidation, invoiceValidator.requestValidationResult, invoiceController.addInvoice);
// router.post("/addServicecallComments",[[multer().single("bugAttachments")], verifyToken()], servicecallController.addServicecallTrans);
router.put("/:bugMasterId", verifyToken(), invoiceController.updateInvoice);
router.delete("/:bugMasterId/delete", verifyToken(), invoiceController.deleteInvoice);
router.get("/:Id/detail", verifyToken(), invoiceController.invoiceDetailById);
router.get("/:statusId/count", verifyToken(), invoiceController.getInvoicesDashboard);

//SERVICECALL COMMENTS
router.get('/item/getItemsList', verifyToken(), invoiceController.getItemsList);
router.post("/item/addItem",verifyToken(), function(req, res, next){
    singleUpload(req, res, function(err){
       next(err);
    });
}, invoiceValidator.addItemValidation, invoiceValidator.requestValidationResult, invoiceController.addItem);
router.post("/item/updateItem", verifyToken(), function(req, res, next){
    singleUpload(req, res, function(err){
       next(err);
    });
}, invoiceValidator.addItemValidation, invoiceValidator.requestValidationResult, invoiceController.updateItem);
router.delete("/item/:itemId/delete", verifyToken(), invoiceController.deleteItem);
router.get("/item/:Id/detail", verifyToken(), invoiceController.itemDetailById);
router.post("/item/downloadImg",  function(req, res, next){
    
    req.body.filename='https://servicecalluploads.s3.ap-south-1.amazonaws.com/1623914503385email.PNG';
     s3Download(req, res, (err)=>{
        if(err){
            next(err);
        }
        else {
                console.log("File downloaded");
        }
    });

});

export default router;