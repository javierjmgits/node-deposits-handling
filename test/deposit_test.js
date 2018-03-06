process.env.DB_URL = "mongodb://localhost:27033/deposit";

const embeddedMongoDB = require('node-embedded-mongodb');
const database = require('../database');

const depositService = require('../service/deposit');
const assert = require('assert');

describe("Deposit service", function () {

    beforeEach(done => {

        return embeddedMongoDB.start(null, null, 27033, error => {
            if (error) {
                return done(error);
            }

            return database.connect()
                .then(() => done())
                .catch(error => done(error));
        });
    });

    afterEach(done => {

        database.disconnect()

            .then(() => {

                return embeddedMongoDB.stop(27033, false, error => {

                    if (error) {
                        return done(error);
                    }

                    return done();
                });

            }).catch(error => done(error))
    });

    it("returns the right results", function (done) {

        const transactions = [
            // confirmed for JMG
            {
                "txid": "1",
                "address": "addressJMG",
                "amount": 10,
                "confirmations": 6
            },
            // repeated
            {
                "txid": "1",
                "address": "addressJMG",
                "amount": 10,
                "confirmations": 6
            },
            // not confirmed for JMG
            {
                "txid": "2",
                "address": "addressJMG",
                "amount": 15,
                "confirmations": 5
            },
            // confirmed for JMG
            {
                "txid": "3",
                "address": "addressJMG",
                "amount": 20,
                "confirmations": 15
            },
            // not confirmed for unknown customer 1
            {
                "txid": "4",
                "address": "otherAddress1",
                "amount": 1,
                "confirmations": 5
            },
            // repeated
            {
                "txid": "5",
                "address": "otherAddress1",
                "amount": 1000,
                "confirmations": 5
            },
            // confirmed for unknown customer 1 (max deposit)
            {
                "txid": "6",
                "address": "otherAddress1",
                "amount": 500,
                "confirmations": 10
            },
            // repeated
            {
                "txid": "6",
                "address": "otherAddress1",
                "amount": 500,
                "confirmations": 10
            },
            // confirmed for unknown customer 2 (min deposit)
            {
                "txid": "7",
                "address": "otherAddress2",
                "amount": 3,
                "confirmations": 10
            },
            // confirmed for unknown customer 2
            {
                "txid": "8",
                "address": "otherAddress2",
                "amount": 12,
                "confirmations": 10
            }
        ];

        const customers = [
            {
                "address": "addressJMG",
                "name": "Javier Moreno Garcia"
            }
        ];

        depositService.handleDeposits(transactions, customers).then(result => {

            assert.equal('Javier Moreno Garcia', result.knownCustomerValues[0].name);
            assert.equal(2, result.knownCustomerValues[0].count);
            assert.equal(30, result.knownCustomerValues[0].sum);

            assert.equal(3, result.unknownCustomerValue.count);
            assert.equal(515, result.unknownCustomerValue.sum);

            assert.equal(3, result.minDeposit);
            assert.equal(500, result.maxDeposit);

            return done();
        }).catch(error => {
            return done(error);
        })
    });
});