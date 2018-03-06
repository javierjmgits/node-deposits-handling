//
//

const mongoose = require('mongoose');

//
// schemas

const Schema = mongoose.Schema;

const transactionSchema = new Schema({
    'involvesWatchonly': {type: Boolean},
    'account': {type: String},
    'address': {type: String},
    'category': {
        type: String, enum: ['generate', 'immature', 'receive', 'send']
    },
    'amount': {type: Number},
    'label': {type: String},
    'vout': {type: Number},
    'confirmations': {type: Number},
    'blockhash': {type: String},
    'blockindex': {type: Number},
    'blocktime': {type: Date},
    'txid': {type: String},
    'walletconflicts': [],
    'time': {type: Date},
    'timereceived': {type: Date},
    'bip125-replaceable': {
        type: String, enum: ['yes', 'no']
    }
}, {collection: 'transactions'});

const transactionRepository = mongoose.model('transaction', transactionSchema);

//
// exports

module.exports = {

    connect: () => {
        return mongoose.connect(process.env.DB_URL);
    },

    disconnect: () => {
        return mongoose.disconnect();
    },

    getTransactionRepository: function () {
        return transactionRepository;
    }

};


