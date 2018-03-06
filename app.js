const fs = require(('fs'));

//
// sets the environment

process.env.DB_URL = process.env.DB_URL || "mongodb://localhost:27017/deposit";

//
// database

const database = require('./database');
database.connect().catch(error => {
    console.error("Error connecting to DB!", error);
    process.exit(1);
});

//
// service

const depositService = require('./service/deposit');

Promise.all([
    readFileAndReturnJson('txs.json'),
    readFileAndReturnJson('known_customers.json'),

]).then((transactionsAndCustomers) => {

    const transactions = transactionsAndCustomers[0].transactions;
    const customers = transactionsAndCustomers[1];

    return depositService.handleDeposits(transactions, customers)

}).then(result => {

    result.knownCustomerValues.forEach(value => {

        console.log(`Deposited for ${value.name}: count=${value.count} sum=${value.sum.toFixed(8)}`)
    });

    const noReferenceValue = result.unknownCustomerValue;

    console.log(`Deposited without reference: count=${noReferenceValue.count} sum=${noReferenceValue.sum.toFixed(8)}`);
    console.log(`Smallest valid deposit: ${result.minDeposit.toFixed(8)}`);
    console.log(`Largest valid deposit: ${result.maxDeposit.toFixed(8)}`);

}).catch(error => {
    console.error(error)

}).then(() => {
    database.disconnect();
});

function readFileAndReturnJson(filepath) {

    return new Promise((resolve, reject) => {
        fs.readFile(filepath, 'utf8', (err, content) => {
            if (err) {
                reject(err)
            } else {
                try {
                    resolve(JSON.parse(content));
                } catch (err) {
                    reject(err)
                }
            }
        })
    });
}
