import express from 'express';
import userController  from '../controller/user/index.js';
import userValidator  from '../validators/userValidator.js';
import { verifyToken } from '../middlewares/userAuth.js';

const router = express.Router();


//create new user
router.post('/addUser', verifyToken(), userValidator.signUpValidation, userValidator.requestValidationResult, userController.signUp);

//update user
router.put("/:userId", verifyToken(), userValidator.userUpdateValidation, userValidator.requestValidationResult, userController.updateUser);

//login
router.post('/signIn', userValidator.signInValidation, userValidator.requestValidationResult, userController.signIn);

router.post('/update-password', verifyToken(), userValidator.changePasswordValidation, userValidator.requestValidationResult, userController.updatePassword);

router.post('/logout', verifyToken(), userController.logOut);

router.get("/getUsersList", verifyToken(), userController.getUsersList);

router.get("/getImplementorsList", verifyToken(), userController.getImplementorsList);

router.get("/:userId/detail", verifyToken(), userController.userDetailById);

router.delete("/userEnableDisable/:userId/:userStatus", verifyToken(), userController.userEnableDisable);

export default router;