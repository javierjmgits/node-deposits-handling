const database = require('../database');

const transactionRepository = database.getTransactionRepository();

function handleDeposits(transactions, knownCustomers) {

    return transactionRepository.insertMany(transactions)

        .then(() => {

            return transactionRepository.aggregate([
                {
                    $sort: {
                        txid: 1
                    }
                },
                {
                    $match: {
                        confirmations: {
                            "$gte": 6
                        }
                    }
                },
                {
                    $group:
                        {
                            _id: "$txid",
                            address: {$first: "$address"},
                            amount: {$first: "$amount"}
                        }
                }

            ])

        }).then(confirmedTransactions => {

            const mapCustomerAddressAndName = knownCustomers.reduce((map, obj) => {
                map[obj.address] = obj.name;
                return map;
            }, {});

            const mapCustomerNameAndValue = {};
            let minDeposit;
            let maxDeposit;

            confirmedTransactions.forEach(transaction => {

                const mapKey = mapCustomerAddressAndName[transaction.address] || '_unknown_';

                const mapValue = mapCustomerNameAndValue[mapKey] || {count: 0, sum: 0};

                const amount = transaction.amount;

                if (minDeposit === undefined || minDeposit > amount) {
                    minDeposit = amount;
                }

                if (maxDeposit === undefined || maxDeposit < amount) {
                    maxDeposit = amount;
                }

                mapValue.count += 1;
                mapValue.sum += amount;

                mapCustomerNameAndValue[mapKey] = mapValue;
            });

            const unknownCustomerValue = mapCustomerNameAndValue['_unknown_'];
            delete mapCustomerNameAndValue['_unknown_'];

            return {
                knownCustomerValues: knownCustomers.map(item => {
                    const value = mapCustomerNameAndValue[item.name];
                    return {
                        name: item.name,
                        count: value.count,
                        sum: value.sum
                    }
                }),
                unknownCustomerValue: unknownCustomerValue,
                minDeposit: minDeposit,
                maxDeposit: maxDeposit
            };
        });
}

//
// exports

module.exports = {

    handleDeposits: handleDeposits
};