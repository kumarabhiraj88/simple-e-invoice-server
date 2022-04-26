import messageHelper from '../helpers/messages.js';
import jwtHelper from '../helpers/jwt.js';

export const verifyToken = () => {
	return async (req, res, next) => {
        try { 
            const token = req.header('Authorization');
            if(!token){
                throw Error(messageHelper.TOKEN_REQUIRED);
            }
        
            const user = await jwtHelper.decryptToken(token);
            req.user = user;
            next();

        }catch(error){
            next(error);
        }
    }
}
