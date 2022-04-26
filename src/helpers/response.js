const data = (res, resData, resCode, resmessage='') => {
    res.status(resCode).json({
        is_success:     true,
        data:           resData,
        message:        resmessage,
        responseCode:   resCode
    });
};

const errorCode = (error) =>{
    let code = 400;
    switch(error.name){
        case 'ValidationError':
            code = 422;
        break;
        case 'Server Error':
			code = 500;
			break;
		case 'JsonWebTokenError':
		case 'unauthorized':
			code = 401;
			break;
		case 'Not Found':
			code=404
		default:
			break;
    }
    return code;
}

const failure = (res, error) => {
    //here errorCode(error) is used to get the response code of that error from the above function
    res.status(errorCode(error)).json({
        is_success:     false,
        data: '',
        message:        error.message ? error.message : error,
        responseCode:   errorCode(error)
    });
}

const success = (res, message, code) => {
    res.status(code).json({
        is_success: true,
        message: message,
        responseCode: code
    });
}

const page = (res, items, total, page_no, code) => {
	res.status(code).json({
		is_success: true,
		data: {
			items: items,
			skip: page_no || 0,
			total: total || items.length
		},
		responseCode: code
	});
	
};

export default {
    data,
    failure,
    success,
    page
}