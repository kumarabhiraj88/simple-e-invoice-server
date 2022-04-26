import responseHelper from '../helpers/response.js';

const GlobalErrorHandler = (error, req, res, next) => {
    responseHelper.failure(res, error);
}

export default GlobalErrorHandler;