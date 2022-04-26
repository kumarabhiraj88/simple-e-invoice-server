import validator from 'express-validator';
import messageHelper from '../helpers/messages.js';
import responseHelper from '../helpers/response.js';

//if any error happends with check() then passes to validationResult()
const { check, validationResult } = validator;

//here checking with the urlparsed data from forms whether it is valid or not
const addInvoiceValidation = [
   
    check('invoiceNumber')
    .notEmpty()
    .withMessage('Invoice Number required'),
    // check('assignedTo')
    // .notEmpty()
    // .withMessage('Choose the Implementor'),
    
];

const addItemValidation = [
    check('productDetails')
    .notEmpty()
    .withMessage('product Details required'),
    check('qty')
    .notEmpty()
    .withMessage('Qty required'),
    check('unit')
    .notEmpty()
    .withMessage('Unit required'),
    check('unitPrice')
    .notEmpty()
    .withMessage('unit Price required'),
    
];


const requestValidationResult = (req, res, next) => {
    const errors = validationResult(req);
    if(errors.array().length > 0){
      responseHelper.failure(res, errors.array()[0].msg);
    }
    else{
        next();
    }
}

export default {
    addInvoiceValidation,
    addItemValidation,
    requestValidationResult
}