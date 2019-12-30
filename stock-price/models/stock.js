const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
    symbol: {
        type: String,
        required: true
    },
    likedby: {
        type: [String]
    },
});


const Stock = new mongoose.model('stocks', stockSchema)


exports.Stock = Stock