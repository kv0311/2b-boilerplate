// Write your answer here

const csv = require('csv-parser'); // to read parse file
const fs = require('fs'); // read file
const axios = require('axios'); // call http restful api
const numeral = require('numeral'); // format number
const dotenv = require('dotenv') // read env file
dotenv.config()

const TRANSACTION_TYPE = {
    DEPOSIT: 'DEPOSIT',
    WITHDRAW: 'WITHDRAW',
}

const transactionData = [];

fs.createReadStream('data/transactions.csv')
    .pipe(csv())
    .on('data', (row) => {
        transactionData.push(row)
    })
    .on('end', () => {
        /* Processing data when CSV file successfully processed */
        console.log('CSV file successfully processed');
        calculatePortfolio(transactionData)

    });

/* Function to calculate and println my portfolio */
async function calculatePortfolio(transactionData) {
    try {
        let result = [];
        /* Group by and sum amount transaction history */
        transactionData.reduce(function (res, value) {
            if (!res[value.token]) {
                res[value.token] = { token: value.token, amount: 0 };
                result.push(res[value.token])
            }
            let totalValueTransaction = value.transaction_type == TRANSACTION_TYPE.DEPOSIT ? value.amount : -value.amount
            res[value.token].amount += parseFloat(totalValueTransaction);
            return res;
        }, {});

        /* Get price and format message */
        let msg = '';
        for (let i = 0; i < result.length; i++) {
            const totalUSD = await axios.get(`${process.env.GET_PRICE_API}?fsym=${result[i].token}&tsyms=USD&api_key=${process.env.API_KEY}`)
            result[i].totalUSD = totalUSD.data.USD * result[i].amount
            msg += `Token: ${result[i].token} - Amount: ${numeral(result[i].amount).format('0,0')} - Total Value (USD): ${numeral(result[i].totalUSD).format('0,0')}\n`
        }
        console.log("My portfolio:\n")
        console.log(msg);
    } catch (err) {
        console.log(err);
    }
}