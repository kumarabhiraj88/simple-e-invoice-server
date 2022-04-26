import aws from 'aws-sdk';
import multer from 'multer';
import multerS3 from 'multer-s3';

import dotenv from 'dotenv';
dotenv.config();

import messageHelper from './messages.js';

const { AWS_BUCKET_REGION, AWS_BUCKET_NAME, AWS_ACCESS_KEY, AWS_SECRET_ACCESS_KEY } = process.env;


aws.config.update({
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
  accessKeyId: AWS_ACCESS_KEY,
  region: AWS_BUCKET_REGION,
});

const s3 = new aws.S3();

const fileFilter = (req, file, cb) => {
  
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'application/pdf') {
  //if (file.mimetype === 'application/pdf') {
      cb(null, true)
  } else {
     cb(new Error('Invalid File Type, only JPEG, PNG and PDF are allowed'), false);
     //cb(new Error('Invalid Mime Type, only PDF is allowed'), false);
  }
}

//before uploading try to disable Block access in AMAZONE S3
 //var s3url = "https://" + AWS_BUCKET_NAME +"s3"+ AWS_BUCKET_REGION + "amazonaws.com/" + req.user.userId + ".png"

//for single file upload
export const scImgUpload = multer({
  fileFilter,
  storage: multerS3({
    s3: s3,
    bucket: AWS_BUCKET_NAME,
    acl: 'public-read',
    key: function (req, file, cb) {
      cb(null, Date.now() + file.originalname)
    },
    limits:{fileSize: 3000000} //in bytes 3000000 bytes = 3mb
  })
})

export const companyImgUpload = multer({
  fileFilter,
  storage: multerS3({
    s3: s3,
    bucket: AWS_BUCKET_NAME,
    acl: 'public-read',
    key: function (req, file, cb) {
      cb(null, 'companyLogo/'+ Date.now() + file.originalname)
    },
    limits:{fileSize: 3000000} //in bytes 3000000 bytes = 3mb
  })
})

export const s3Download = async (req, res) =>{
  try{
 // const imgUrl=req.body.filename;
 const imgUrl='1623914503385email.PNG';
 res.attachment(imgUrl)
    var params = {	
      Key: `${imgUrl}`,
      Bucket: AWS_BUCKET_NAME
    };
    const fileObject= await s3.getObject(params).createReadStream();
    return fileObject.pipe(res);

  }catch(error){
    return error
  }
}


//# This function for delete file from s3 bucket
export const s3delete = async (filename) =>{
	try{
		var params = {	
			Key: `${filename}`,
			Bucket: AWS_BUCKET_NAME
		};
		let unlinkFile = await s3.deleteObject(params).promise();
	//	console.log('file deleted', unlinkFile)
		return unlinkFile;
	}catch(error){
		return error
	}
}


