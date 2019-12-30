const Joi = require('@hapi/joi');
const axios = require('axios');


const STOCK_API_END_POINT = 'https://repeated-alpaca.glitch.me/v1/stock/';


function validateWithJoi(req) {
    return Joi.object({
        stock: Joi.alternatives()
            .try(Joi.string(), Joi.array().items(Joi.string()))
            .required(),
        like: Joi.boolean().default(false)
    }).validate(req.query);
}
exports.validateWithJoi = validateWithJoi;
async function stockApi(stockSymbol) {
    try {
        const response = await axios.get(`${STOCK_API_END_POINT}${stockSymbol}/quote`);
        return { response, error: false };
    }
    catch (error) {
        console.error(error);
        return { error: true, errorMsg: error.message };
    }
}
exports.stockApi = stockApi;
function parseHeader(req) {
    let output = {
        ipaddress: req.ip.substr(7),
        language: req.headers['accept-language'],
        software: req.headers['user-agent']
    };
    return output;
}
exports.parseHeader = parseHeader;
