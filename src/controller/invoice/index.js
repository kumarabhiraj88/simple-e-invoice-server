// const awsHelper = require('../../helpers/aws');

import invoiceMasterModel from '../../models/invoiceMaster.js';
import invoiceTransModel from '../../models/invoiceTransactions.js';
import messageHelper from '../../helpers/messages.js';
import responseHelper from '../../helpers/response.js';

import { s3delete } from '../../helpers/aws.js';

import pdfFunc from './pdf-gen.js';
import fs from 'fs'

import QRCode  from 'qrcode';
import utf8 from 'utf8';



const getInvoicesDashboard = async (req, res, next) => {
	try {
		
			let loggedPrivilegeId = req.query.loggedPrivilegeId;
			const { statusId }  = req.params;
			let condition = {};
			if(loggedPrivilegeId=='3'){
				condition = { bugStatus: statusId};
			}
			else{
				condition = { bugStatus: statusId };
			}
			
			let invoiceCount = await invoiceMasterModel.find(condition).countDocuments();
			responseHelper.data(res, invoiceCount, 200, '');									
	}
	catch(err) {
		next(err);
	}
}

const getInvoicesList = async (req, res, next) => {
	try { 
			let limit = parseInt(req.query.limit);
			let skip = parseInt(req.query.skip);
			let query = req.query.query;
			let criteria = {};

			let loggedPrivilegeId = req.query.loggedPrivilegeId;
			let loggedUserId = req.query.loggedUserId;
			

			 if(query){
			 	criteria = {
			 		...criteria,
			 		$or: [
			 			{ invoiceNumber: { $regex: query } },
			 			
			 		]
			 	}
			 }

			if (req.query.pagination == 'false') { 
				let invoicelist = await invoiceMasterModel.find()
												.select('invoiceNumber createdAt')
												.populate({
														path: 'filedBy',
														select: 'fullName'
													})
												.sort({'_id': -1});
				responseHelper.data(res, invoicelist, 200, '');
			}
			else { 
			let invoicelist = await invoiceMasterModel.find(criteria)
												.select('invoiceNumber createdAt')
												.populate({
														path: 'filedBy',
														select: 'fullName'
													})
												//.skip(skip)
												//.limit(limit)
												.sort({'_id': -1});
			let totalInvoicesCount = await invoiceMasterModel.countDocuments(criteria);
			responseHelper.page(res, invoicelist, totalInvoicesCount, skip, 200);
		}
	}
	catch(err) {
		next(err);
	}
}

const addInvoice = async (req, res, next) => {
	try {
			
		//	console.log(req.body);

		let formObj=req.body;


		//To get the last object value (for invoice master details lastly updated)
		var keys = Object.keys(formObj);
		var last = keys[keys.length-1];
		let invNumber= formObj[last].masterData.invoiceNumber;

		//get the first object(filedBy is only with the initail object)
		let invFiledBy= formObj[0].masterData.filedBy;

		let invMasterForm;
		invMasterForm = {  
			invoiceNumber: invNumber,
			filedBy: invFiledBy,
		}

			


			//here just pass the values to the model to get the _id(masterId) for transaction table
			//and save this to master table with insertion in transaction table 
			let saveInvMaster = new invoiceMasterModel(invMasterForm);

			try {
			Object.keys(formObj).forEach(key => {
				if(formObj[key].subData.productDetails){

						let saveInvTransactions= new invoiceTransModel({
							masterId: saveInvMaster._id,
							productDetails: formObj[key].subData.productDetails,
							qty: formObj[key].subData.qty,
							unit: formObj[key].subData.unit,
							unitPrice: formObj[key].subData.unitPrice,
						});
						saveInvTransactions.save();
						//pushing the master id to the transaction array and then saving the array in Master table
						//unshift() is an array function in Node.js, used to insert element to the front of an array.
						saveInvMaster.invoiceChild.unshift(saveInvTransactions._id);
						//console.log('working first');
				}
				
			} );

		}finally {
			//console.log('working second');
			await saveInvMaster.save();
		  }
			
			
			
			
			
			
			const invDefaultId=saveInvMaster._id;
			
			//local file root directory
			const {INIT_CWD} = process.env; // process.env.INIT_CWD 
			const rootPath =`${INIT_CWD}`;

		  //file root directory
				const {SERVER_FILES_PATH} = process.env; // process.env.SERVER_FILES_PATH 
		
				const imagePath = SERVER_FILES_PATH;
				const pdfPath=imagePath+'/static/pdf/'+invDefaultId+'.pdf';
				
					
					//QRCode.toFile(`${imagePath}/static/qrcodes/${invDefaultId}.png`, TextToConvert, {

			//qrcode generation starts...........................
			//const TextToConvert = utf8.encode(`${imagePath}/static/pdf/${invDefaultId}.pdf`);
			const TextToConvert = utf8.encode(pdfPath);
			QRCode.toFile('./simple-e-invoice-qrcodes/'+invDefaultId+'.png', TextToConvert, {
				// color: {
				//   dark: '#00F',  // Blue dots
				//   light: '#0000' // Transparent background
				// }
			  }, function (err) {
				if (err) throw err
				console.log('Qr code generated successfully');


				// pdf generation starts here................................
						
				pdfFunc.buildPdf(invDefaultId, formObj);

				//pdf generation ends here................................



			  })
			//qrcode generation ends.............................


			responseHelper.data(res, saveInvMaster, 200, messageHelper.INVOICE_ADDED);



	}
 catch (error) {
			next(error);
		}
	};
	

// const addInvoice = async (req, res, next) => {
// 	try {
// 		let sessionUserId = await getSessionUserId(req);
// 		//req.body.filedBy=sessionUserId;

// 		//console.log(req);
// 		let scMasterForm = {  companyId: req.body.companyId,
// 							  productId: req.body.productId,
// 							  filedBy: sessionUserId,
// 							  assignedTo: req.body.assignedTo,
// 							  expectedCompletionDate: req.body.expectedCompletionDate,
// 							  bugStatus: req.body.bugStatus
// 							}
							
// 		//let servicecallForm = await servicecallValidator.addInvoice.validateAsync(scMasterForm);
		
// 		let saveScMaster = new invoiceMasterModel(scMasterForm);

// 		// if (req.file) {
// 		// 	const scImageUrl = await awsHelper.s3Upload(
// 		// 		req.file,
// 		// 		'scImages'
// 		// 	);
// 		// 	if (scImageUrl.errors) {
// 		// 		throw Error(scImageUrl.message);
// 		// 	}
// 		// 	bugAttachmentsUrl = scImageUrl;
// 		// }
// 		// else { bugAttachmentsUrl = ''; }


// 		let saveScTransactions= new invoiceTransModel({
// 			masterId: saveScMaster._id,
// 			bugDescription: req.body.bugDescription,
// 			//bugAttachments: bugAttachmentsUrl,
// 			updatedBy: sessionUserId,
// 		});

// 		await saveScTransactions.save();
// 		//unshift() is an array function in Node.js, used to insert element to the front of an array.
// 		saveScMaster.bugChild.unshift(saveScTransactions._id)
// 		await saveScMaster.save();

// 		responseHelper.data(res, saveScMaster, 200, messageHelper.SERVICECALL_ADDED);
// 	} catch (error) {
// 		next(error);
// 	}
// };


const invoiceDetailById = async (req, res, next) => {
	try { 
		

			const { Id }  = req.params;
			const invoice = await invoiceMasterModel
									.findOne({ _id: Id })
									.select('invoiceNumber createdAt')
									.populate({
											path: 'filedBy',
											select: 'fullName'
										})
										// .aggregate([
										// 	{ $lookup:
										// 	   {
										// 		 from: 'bugtransactions',
										// 		 localField: 'masterId',
										// 		 foreignField: '_id',
										// 		 as: 'transactiondetails'
										// 	   }
										// 	 }
										// 	]).toArray()
									
									.populate({
												 path: 'invoiceChild',
												// model: 'invoicetransactions',
												 select: 'bugDescription bugAttachmentsUrl updatedBy',
												 populate: {
														 path: 'updatedBy',
														 model: 'user',
														 select: 'fullName'
												 		}
											});
			if (!invoice) {
				throw Error(messageHelper.INVOICE_NOT_EXIST);
			}

				//file root directory
				const {SERVER_FILES_PATH} = process.env; // process.env.SERVER_FILES_PATH 
		
				const imagePath = SERVER_FILES_PATH;
				let responseData = { 
					invoice,
					'imagePath': `${imagePath}/static/qrcodes/${Id}.png` 
					};
				responseHelper.data(res, responseData, 200);				

	} catch (err) {
		next(err);
	}
}

const updateInvoice = async (req, res, next) => {
	try {
			//delete req.body.bugId;
			const { bugMasterId } = req.params;

			//fetching the db status to compare with the new status from the form
			//if both are not same, then create a transaction with new status for a log purpose
			const transaction = await invoiceMasterModel
									.findOne({ _id: bugMasterId })
									.select('bugStatus bugChild');
			
			let scMasterForm={};
			if(req.body.assignedTo=="")
			{
				scMasterForm = {  
										companyId: req.body.companyId,
										productId: req.body.productId,
										//filedBy: sessionUserId,
										expectedCompletionDate: req.body.expectedCompletionDate,
										bugStatus: req.body.bugStatus,
										bugChild: transaction.bugChild
								}
								
			}
			else{

				scMasterForm = { 
										companyId: req.body.companyId,
										productId: req.body.productId,
										//filedBy: sessionUserId,
										assignedTo: req.body.assignedTo,
										expectedCompletionDate: req.body.expectedCompletionDate,
										bugStatus: req.body.bugStatus,
										bugChild: transaction.bugChild
										
								}
								
			}

							
			if(transaction.bugStatus != req.body.bugStatus){
				let saveScTransactions= new invoiceTransModel({
					masterId: bugMasterId,
					bugDescription: 'Status changed',
					changedStatus: req.body.bugStatus,
					bugAttachmentsUrl: "",
					updatedBy: req.body.filedBy,
				});
			await saveScTransactions.save();
			scMasterForm.bugChild.unshift(saveScTransactions._id);
			}
			const invoice = await invoiceMasterModel.updateOne({_id: bugMasterId}, scMasterForm );
			if (!invoice) {
				throw Error(messageHelper.INVOICE_NOT_EXIST);
			}
			responseHelper.data(res, invoice, 200, messageHelper.INVOICE_UPDATED);
		
	} catch (err) {
		next(err);
	}
}


// const exportServicecall = async (req, res, next) => {
// 	try {

// 		let servicecall = await invoiceMasterModel.find()
// 												.select('bugId bugStatus createdAt')
// 												.populate({
// 														path: 'companyId',
// 														select: 'companyName'
// 													})
// 												.populate({
// 														path: 'productId',
// 														select: 'productName'
// 													})
// 												.populate({
// 														path: 'filedBy',
// 														select: 'Name'
// 													})
// 												.sort({'_id': -1});

// 		responseHelper.data(res, servicecall, 200);
// 	} catch (error) {
// 		next(error);
// 	}
// };

const deleteInvoice = async (req, res, next) => {
	try {
		const { bugMasterId } = req.params;
		let invoice = await invoiceMasterModel.deleteOne({'_id': bugMasterId});

		//fetch the file name of the transaction to delete file from s3 bucket
		const result = await invoiceTransModel.find({ masterId: bugMasterId }).select('bugAttachmentsUrl');
			result.map((item)=>{
				//Passing the file name to aws page  to delete the file
				//console.log(item.bugAttachmentsUrl);
				s3delete(item.bugAttachmentsUrl);	
			})
				
		let bugTransactions = await invoiceTransModel.deleteMany({'masterId':bugMasterId})
												
		responseHelper.data(res, invoice, 200, messageHelper.INVOICE_DELETED);
	} catch (error) {
		next(error);
	}
};


//SERVICECALL COMMENTS

const getItemsList = async (req, res, next) => {
	try { 
			let masterId = req.query.masterId;
			let limit = parseInt(req.query.limit);
			let skip = parseInt(req.query.skip);
			let query = req.query.query;
			
			let criteria = {masterId: masterId};
			//  if(query){ 
			//  	criteria = {
			//  		...criteria,
			//  		$or: [
			//  			{ bugDescription: { $regex: query } },
			//  			{ updatedBy: { $regex: query, $options:'i' } },
			//  		],
			// 		$and: [{ masterId: masterId}]
			//  	}
			//  }

			
			let commentist = await invoiceTransModel.find(criteria)
												.select('productDetails qty unit unitPrice')
												.skip(skip)
												.limit(limit)
												.sort({'_id': -1});


			let totalCommentsCount = await invoiceTransModel.countDocuments(criteria);
			responseHelper.page(res, commentist, totalCommentsCount, skip, 200);
		
	}
	catch(err) {
		next(err);
	}
}


const itemDetailById = async (req, res, next) => {
	try { 
			const { Id }  = req.params;
			const comment = await invoiceTransModel
									.findOne({ _id: Id })
									.select('productDetails qty unit unitPrice updatedAt')
								
			if (!comment) {
				throw Error(messageHelper.COMMENT_NOT_EXIST);
			}
			responseHelper.data(res, comment, 200);
	} catch (err) {
		next(err);
	}
}

const addItem = async (req, res, next) => {
	try {
			// originalname: 'Dashboard sample.png',
			//key: '60ae1f44f46de433cc52d0f2Dashboard sample.png',
			//const uploadPath = req.file ? req.file.location : '';
			const uploadPath = req.file ? req.file.key : '';

			//save comments to the transaction table
			let saveInvTransactions= await new invoiceTransModel({
							masterId: req.body.masterId,
							productDetails: req.body.productDetails,
							qty: req.body.qty,
							unit: req.body.unit,
							unitPrice: req.body.unitPrice
						}).save();
			
			let invMasterForm = {  
				bugChild: saveInvTransactions._id
			  }
			//update those transaction ids to the master table
			let invMaster = await invoiceMasterModel.updateOne({ _id: req.body.masterId },  { $addToSet: invMasterForm })
			
			let responseData = { 
                masterId: req.body.masterId 
                };
			responseHelper.data(res, responseData, 200, messageHelper.COMMENT_ADDED);
	}
 catch (error) {
			next(error);
		}
	};

const updateItem = async (req, res, next) => {
	try {	
		
			//Passing the file name to aws page  to delete the old file
			s3delete(req.body.bugAttachmentsUrlOld);

			//const uploadPath = req.file ? req.file.location : req.body.bugAttachmentsUrl;
			const uploadPath = req.file ? req.file.key : req.body.bugAttachmentsUrl;
			const itemId = req.body.itemId;
			
			let scTransactionForm = {  
								productDetails: req.body.productDetails,
								qty: req.body.qty,
								unit: req.body.unit,
								unitPrice: req.body.unitPrice
			  }

			let saveScTransactions = await invoiceTransModel.updateOne({_id: itemId}, scTransactionForm, { new: true } );

			let responseData = { 
                masterId: req.body.masterId 
                };
			responseHelper.data(res, responseData, 200, messageHelper.COMMENT_UPDATED);
		
	} catch (err) {
		next(err);
	}
}

const deleteItem = async (req, res, next) => {
	try { 
		const { commentId } = req.params;

		const transResult = await invoiceTransModel.findOne({ _id: commentId }).select('masterId');
		
		//fetch the file name of the transaction to delete file from s3 bucket
		const result = await invoiceTransModel.findOne({ _id: commentId }).select('bugAttachmentsUrl');

		//Passing the file name to aws page  to delete the file
		s3delete(result.bugAttachmentsUrl);						

		let bugTransactions = await invoiceTransModel.deleteMany({'_id':commentId});
		
		//https://servicecalluploads.s3.ap-south-1.amazonaws.com/60ae1f44f46de433cc52d0f2em.PNG
		//console.log(bugTransactions);
		let responseData = { 
			masterId: transResult.masterId 
			};

		responseHelper.data(res, responseData, 200, messageHelper.COMMENT_DELETED);
	} catch (error) {
		next(error);
	}
};



export default {
    getInvoicesList,
    addInvoice,
    invoiceDetailById,
	updateInvoice,
	getInvoicesDashboard,
	//exportServicecall,
	deleteInvoice,

	getItemsList,
	itemDetailById,
	addItem,
	updateItem,
	deleteItem
}