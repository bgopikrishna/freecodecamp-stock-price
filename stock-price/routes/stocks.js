const { parseHeader, validateWithJoi, stockApi } = require('../helpers');
const express = require('express');
const { Stock } = require('../models/stock');
const { mongoose } = require('mongoose');

const router = express.Router();

router.get('/', async (req, res) => {
    // let queryObj = req.query;
    let ipaddress = req.headers.host;

    const queryObj = validateWithJoi(req);

    if (queryObj.error) {
        return res.send(queryObj.error.message);
    }

    const { stock, like } = queryObj.value;

    if (Array.isArray(stock)) {
        let [stock1, stock2] = stock;
        let { stockToBeEval: stockEvalOf1 } = await findOrCreateStock(
            stock1,
            like,
            ipaddress
        );

        let { stockToBeEval: stockEvalOf2 } = await findOrCreateStock(
            stock2,
            like,
            ipaddress
        );

        let { response: responeof1, error } = await stockApi(stock1);
        let { response: responeof2, error } = await stockApi(stock2);

        const stockData = [
            {
                stock: stockEvalOf1.symbol.toUpperCase(),
                price: responeof1.data.latestPrice,
                rel_likes:
                    stockEvalOf1.likedby.length - stockEvalOf2.likedby.length
            },
            {
                stock: stockEvalOf2.symbol.toUpperCase(),
                price: responeof2.data.latestPrice,
                rel_likes:
                    stockEvalOf2.likedby.length - stockEvalOf1.likedby.length
            }
        ];

        return res.send({ stockData });
    } else {
        const { response, error } = await stockApi(stock);
        if (!error) {
            let { stockToBeEval, stockFromDB } = await findOrCreateStock(
                stock,
                like,
                ipaddress
            );

            const { symbol, likedby } = stockToBeEval;
            return res.send({
                stockData: {
                    stock: symbol.toUpperCase(),
                    price: response.data.latestPrice,
                    likes: likedby.length
                }
            });
        }
    }

    // const stock = await Stock.find();

    // res.send(queryObj.value);
});

module.exports = router;

async function findOrCreateStock(stock, like, ipaddress) {
    const stockFromDB = await Stock.findOne({
        symbol: stock
    });
    console.log(stockFromDB);
    let stockToBeEval;

    if (!stockFromDB) {
        stockToBeEval = new Stock({
            symbol: stock,
            likedby: like ? [ipaddress] : []
        });
        stockToBeEval = await stockToBeEval.save();
    } else {
        let isItAlreadyLiked = stockFromDB.likedby.includes(ipaddress);

        if (!isItAlreadyLiked) {
            stockToBeEval = like
                ? stockFromDB.likedby.push(ipaddress)
                : stockFromDB;
        }
        stockToBeEval = await stockFromDB.save();
    }
    return { stockToBeEval, stockFromDB };
}
