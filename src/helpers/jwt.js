import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const { JWT_SECRET, JWT_EXPIRE_TIME } = process.env;

//authenticated schema values passed here to generate token
const generateToken = (userDatas) => {
    try{
        //creating the payload for token generation
        const payload = {
            userId:     userDatas._id,
            userName:   userDatas.fullName,
            userEmail:  userDatas.email,
            role:       userDatas.privilegeId
        }
        //generating token here..
        //first argument is payload, seond is secret key from .env, third is expiring time from .env
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRE_TIME } );
        return token;

    }catch (error){
        return error;
    }
}

//Decode and verify the token from client side
//Whether token is valid or not - with the Secret key in the server side
const decryptToken = (clientToken) => {
    try {
        const decodedToken = jwt.verify(clientToken, JWT_SECRET);
        return decodedToken;
    }catch (error){
        return error;
    }
}

export default {
    generateToken,
    decryptToken
}