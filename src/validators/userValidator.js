import validator from 'express-validator';
import messageHelper from '../helpers/messages.js';
import responseHelper from '../helpers/response.js';

//if any error happends with check() then passes to validationResult()
const { check, validationResult } = validator;

//here checking with the urlparsed data from forms whether it is valid or not
const signInValidation = [
    check('Username')
    .isEmail()
    .withMessage('Username should be Email Id'),
    check('Password')
    .isLength({ min: 5 })
    .withMessage('Password must be atleast 5 character long')
];


const signUpValidation = [
    check('fullName')
    .notEmpty()
    .withMessage('Name is required'),
    check('email')
    .isEmail()
    .withMessage('Email is not Valid'),
    check('pwd')
    .isLength({ min: 5 })
    .withMessage('Password must be atleast 5 character long'),
    check('cpassword')
    .custom((value, { req }) => {
        //if request is json, use - req.body 
        //if request is url, use - req.query
        if(value !== req.body.pwd){
            throw new Error('Confirm Password does not match password');
        }
        return true;
    }),
    check('privilegeId')
    .notEmpty()
    .withMessage('Please choose the Privilege')
    .custom((value, { req }) => {
        console.log("privilegeId value *******", value);
        //if request is json, use - req.body 
        //if request is url, use - req.query
        if(value == '3' && req.body.companyId==""){
            throw new Error('Company is required');
        }
            return true;
        
        
    }),
];

const userUpdateValidation = [
    check('fullName')
    .notEmpty()
    .withMessage('Name is required'),
    check('email')
    .isEmail()
    .withMessage('Email is not Valid'),
    check('pwd')
    .custom((value, { req }) => {
        //if request is json, use - req.body 
        //if request is url, use - req.query
        if(value !== "" && value.length < 5){
            throw new Error('Password must be atleast 5 character long');
        }
        return true;
    }),
    //.isLength({ min: 5 })
    //.withMessage('Password must be atleast 5 character long'),
    check('cpassword')
    .custom((value, { req }) => {
        //if request is json, use - req.body 
        //if request is url, use - req.query
        if(value !=="") {
            if(value !== req.body.pwd){
                throw new Error('Confirm Password does not match password');
            }
        }
        return true;
    }),
    check('privilegeId')
    .notEmpty()
    .withMessage('Please choose the Privilege')
];

const changePasswordValidation = [
    check('Password')
    .notEmpty()
    .withMessage('Password cannot be empty')
    .isLength({ min: 5 })
    .withMessage('Password must be atleast 5 character long'),
    check('cpassword')
    .custom((value, { req }) => {
            if(value !== req.body.Password){
                throw new Error('Confirm Password does not match password');
            }
        return true;
    })
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
    signInValidation,
    signUpValidation,
    userUpdateValidation,
    changePasswordValidation,
    requestValidationResult
}