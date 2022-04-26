import  Usermodel from '../../models/user.js';
import jwtHelper from '../../helpers/jwt.js';
import messageHelper from '../../helpers/messages.js';
import responseHelper from '../../helpers/response.js';
import bcrypt from 'bcrypt';


 const signUp = async (req, res) => {
    try {
        let userExists = await Usermodel.findOne({ email:req.body.email, status:1 }); 
        if(userExists){
            throw Error(messageHelper.USER_EXISTS);
         }

         //destructure the request body
         const {
            fullName,
            email,
            pwd,
            privilegeId,
            companyId
         } = req.body;
       

        //here password not need to be hashed, bcz it is passed to Usermodel before saving
        //it is hashed from Usermodel. (there is a query is written for hashing)

        //Also two conditions bcz,in schema model, companyid's type is object and reference to Company table
        //So an empty field with object  reference not possible(it shows error)

       
        let fieldValues = {
                fullName,
                email,
                pwd,
                privilegeId,
                companyId
             };
             
        let saveUser = await new Usermodel(fieldValues).save();
        responseHelper.data(res, saveUser, 200, messageHelper.USER_ADDED );  
    }catch (error) {
        responseHelper.failure(res, error);
    }
}


const updateUser = async (req, res, next) => {
	try {

            //destructure the request body
            const {
                userId,
                fullName,
                email,
                pwd,
                privilegeId,
                companyId
            } = req.body;

            let dbUserEmail = await Usermodel.findOne({ email:email, _id: { $ne: userId } }); 
            if(dbUserEmail){
                throw Error(messageHelper.EMAIL_EXISTS);
            }

            if(privilegeId!="3"){
                const companyId="";
            }

            if(pwd==""){
                
                if(privilegeId!="3"){
                    var newvalues = { $set: {fullName: fullName, email: email, privilegeId:privilegeId},  $unset: {  companyId: "" } };
                }
                else{
                    var newvalues = { $set: {fullName: fullName, email: email, privilegeId:privilegeId, companyId:companyId } };
                }
                
            }
            else {
                //we must hash the password here, bcz it is not passed to Usermodel before updating
                let hashedPassword = await bcrypt.hash(pwd, 10);
                if(privilegeId!="3"){
                    var newvalues = { $set: {fullName: fullName, email: email, password: hashedPassword, privilegeId:privilegeId } };
                }
                else{
                    var newvalues = { $set: {fullName: fullName, email: email, password: hashedPassword, privilegeId:privilegeId, companyId:companyId } };
                }
            }

           let result = await Usermodel.updateOne({_id: userId}, newvalues );
		   responseHelper.data(res, result, 200, messageHelper.USER_UPDATED );
		
	} catch (err) {
		next(err);
	}
}



const signIn = async (req, res, next) => {
    try { 
        //if user doesn't exists, then return a null value
        let userExistsResult = await Usermodel.findOne({ email:req.body.Username }); 
        if(!userExistsResult){
          // throw Error(messageHelper.INVALID_CREDENTIALS);
           responseHelper.failure(res, messageHelper.INVALID_CREDENTIALS);
        }
        //comparing input password with above exists result
        let passCheckResult = await bcrypt.compareSync(req.body.Password, userExistsResult.password);
        if(!passCheckResult){
            //throw Error(messageHelper.INVALID_CREDENTIALS);
            responseHelper.failure(res, messageHelper.INVALID_CREDENTIALS);
        }

        let userActiveResult = await Usermodel.findOne({ email:req.body.Username, status:1 }); 
        if(!userActiveResult){
            // throw Error(messageHelper.INVALID_CREDENTIALS);
             responseHelper.failure(res, messageHelper.USER_NOT_ACTIVE);
          }
          let companyData ={};
if(userExistsResult.companyId){
    companyData  = await Companymodel.findOne({ _id: userExistsResult.companyId }); 
}
         //passing the result from schema to the generateToken() function within jwtHelper
        let authToken = jwtHelper.generateToken(userExistsResult);
        let responseData = {
            token: authToken, 
            userid:`${userExistsResult._id}`, 
            name:`${userExistsResult.fullName}`,
            email:`${userExistsResult.email}`,
            privilegeId:`${userExistsResult.privilegeId}`,
            companyId:`${userExistsResult.companyId}`,
            companyLogo: companyData.companyLogoUrl ? `${companyData.companyLogoUrl}` : '',
            company:companyData.companyName ? `${companyData.companyName}` : ''
        }
        //try to pass response code as an integer (not as a string eg not like '200')
        //bcz there is an integer checking code before storing login response values to localStorage
        responseHelper.data(res, responseData, 200);


    } catch (error){
        //next(error);
      responseHelper.failure(res, error);
     
    }
}

const updatePassword = async (req, res) => {
    try {

        const loggedUserId = req.user.userId;
        let newPassword = req.body.Password;
        let hashedPassword = await bcrypt.hash(newPassword, 10);

        //check user exist or not
        let user = await Usermodel.findOne({ _id: loggedUserId }); 
		if (!user) {
			throw messageHelper.USER_NOT_FOUND;
		}

        let result = await Usermodel.updateOne({_id: user._id}, { $set: {password: hashedPassword} });
		responseHelper.data(res, result, 200, messageHelper.PASSWORD_CHANGED );


    }catch(error){
        throw error;
    }
}

const logOut = async (req, res)=> {
    try{
        //decrypted user details from token within verifyToken middleware is passed to the request
        //userId within this request checking with database user document
        let userExists = await Usermodel.findOne({ _id:req.user.userId }); 
        if (!userExists) {
			throw Error(messageHelper.USER_NOT_FOUND);
		}
        //next write the code to remove this user from session on table 
        responseHelper.success(res, messageHelper.LOGOUT_SUCCESS, 200)
    }catch (error){
        responseHelper.failure(res, error)
    }

}

// export const getToken

//      try {

//             //checking if the input email is exists or not
//             await Usermodel.findOne({email:req.body.email})
//             .exec((error, emailresult)=> {
//                 if(emailresult) return res.status(400).json({
//                     message: 'Email exists'
//                 })
//             })

//             //destructure the request body
//             const {
//                 name,
//                 email,
//                 password,
//                 privilege_id
//             } = req.body;
//             //passing the destructured values to the userSchema
//             const _user = new Usermodel({
//                 name, 
//                 email, 
//                 password, 
//                 privilege_id
//             });
//             //saving the values
//             _user.save((error, data) => {
//                 if(error){
//                     return res.status(400).json({
//                         message: 'Insertion Failed'
//                     })
//                 }

//                 if(data){
//                     return res.status(201).json({
//                         result: data
//                     })
//                 }
//             });


//         }catch (error) {
//             res.status().json({
//                 message: error.message
//             })

//          }
 
// }



    const getUsersList = async (req, res, next) => {
    	try {
    			let limit = parseInt(req.query.limit);
    			let skip = parseInt(req.query.skip);
    			let query = req.query.query;
    			let criteria = {};
    			if(query){
    				criteria = {
    					...criteria,
    					$or: [
    						{ fullName: { $regex: query, $options:'i' }  },
    						{ email: { $regex: query, $options:'i' } }
    					]
    				}
    			}
    
    			if (req.query.pagination == 'false') { 
    				let userlist = await Usermodel.find()
    												.select('fullName')
    												.sort({'fullName': 1});
    				responseHelper.data(res, userlist, 200, '');
    			}
    			else { 
                    let userlist = await Usermodel.find(criteria)
                                              .select('fullName email privilegeId status')
                                              .populate({
                                                path: 'companyId',
                                                select: 'companyName'
                                                })
                                             // .skip(skip)
                                             // .limit(limit)
                                              .sort({'fullName': 1});
    			let totalUsersCount = await Usermodel.countDocuments(criteria);
    			responseHelper.page(res, userlist, totalUsersCount, skip, 200);
    			}
    
    	} catch (error) {
    		next(error);
    	}
    }
    
    const getImplementorsList = async (req, res, next) => {
    	try {
    		let userlist = await Usermodel.find({privilegeId: 2})
    												.select('fullName')
    												.sort({'fullName': 1});
    		responseHelper.data(res, userlist, 200, '');
    
    	} catch (error) {
    		next(error);
    	}
    }
    
    const userDetailById = async (req, res, next) => {
    	try {
    			const { userId } = req.params;
    			const user = await Usermodel
    									.findOne({ _id: userId })
                                        .populate("companyId","companyName");
    			if (!user) {
    				throw Error(responseMessage.USER_NOT_EXIST);
    			}
    			responseHelper.data(res, user, 200);
    	} catch (err) {
    		next(err);
    	}
    }
    
    // const addUser = async (req, res, next) => {
    // 	try {
    // 			let userForm = await userValidator.addUser.validateAsync(req.body);
    // 			let saveUser = await new Usermodel(userForm).save();
    
    // 			//let toMail = userForm.Email;
    // 			let toMail = 'kumarabhiraj88@gmail.com';
    // 			let subject = 'Welcome to VenturaServicecall';
    // 			let html =
    // 			'<div><p>' +
    // 			'Hello ' +
    // 			userForm.Name +
    // 			'</p>' +
    // 			'<p>Your account has been created by the Admin of VenturaServicecall.</br> Kindly use to following creds for further activities</p>' +
    // 			'<p>Password : ' +
    // 			userForm.Password +
    // 			'</p>' +
    // 			'</br><p>Thanks and Regards</p>' +
    // 			'<p>VenturaServicecall Team</p></div>';
    // 		await emailFunc.sendEmail(toMail, subject, html);
    
    // 			responseHelper.data(res, saveUser, 200, responseMessage.USER_ADDED);
    // 	} catch(error) {
    // 		next(error);
    // 	}
    // }
    
    
    const userEnableDisable = async (req, res, next) => {
    	try {
    			const { userId, userStatus } = req.params;
    			if(parseInt(userStatus) == 0) { 
    				let userStatus = 1;
    			}
    			else { 
    					let userStatus = 0;
    				 }
    
    			const userResult = await Usermodel.updateOne({_id: userId}, { status: userStatus }, { new: true } );
    			responseHelper.data(res, userResult, 200);
            
    	} catch (err) {
    		next(err);
    	}
    }


export default {
    signUp,
    updateUser,
    signIn,
    updatePassword,
    logOut,
    getUsersList,
    getImplementorsList,
    userEnableDisable,
    userDetailById
}