const sha256 = require('sha256');
const uuid = require('uuid');

const currentNodeUrl = process.argv[3];

function _blockchain() {
    this.chain = [];
    this.pendingTransactions = [];

    this.currentNodeUrl = currentNodeUrl;
    this.networkNodes = [];

    this.createNewBlock(100, 0, 0);
}

_blockchain.prototype.createNewBlock = function (nonce, previousBlockHash, hash) {
    const newBlock = {
        index: this.chain.length + 1,
        timestamp: Date.now(),
        transactions: this.pendingTransactions,
        nonce: nonce,
        hash: hash,
        previousBlockHash: previousBlockHash,
    };

    this.pendingTransactions = [];
    this.chain.push(newBlock);

    return newBlock;
};

_blockchain.prototype.getLastBlock = function () {
    return this.chain[this.chain.length - 1];
};

_blockchain.prototype.createNewTransaction = function (amount, sender, recipient) {
    return {
        transactionId: uuid.v4().split('-').join(''),
        amount: amount,
        sender: sender,
        recipient: recipient,
    };
};

_blockchain.prototype.addTransactionToPendingTransactions = function (newTransaction) {
    this.pendingTransactions.push(newTransaction);

    return this.getLastBlock()['index'] + 1;
};

_blockchain.prototype.hashBlock = function (previousBlockHash, currentBlockData, nonce) {
    const dataAsString = previousBlockHash + nonce.toString() + JSON.stringify(currentBlockData);

    return sha256(dataAsString);
};

_blockchain.prototype.proofOfWork = function (previousBlockHash, currentBlockData) {
    let nonce = 0;
    let hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);

    while (hash.substring(0, 4) !== '0000') {
        nonce++;
        hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
    }

    return nonce;
};

_blockchain.prototype.attachNetworkNode = function (newNetworkNode) {
    if (this.networkNodes.indexOf(newNetworkNode) === -1 && this.currentNodeUrl !== newNetworkNode) {
        this.networkNodes.push(newNetworkNode);

        return true;
    }

    return false;
};

_blockchain.prototype.chainIsValid = function (blockChain) {
    let validChain = true;

    for (let i = 1; i < blockChain.length; i++) {
        const currentBlock = blockChain[i];
        const previousBlock = blockChain[i - 1];

        const blockHash = this.hashBlock(
            previousBlock['hash'],
            {
                index: currentBlock['index'],
                transactions: currentBlock['transactions'],
            },
            currentBlock['nonce']
        );

        if (blockHash.substring(0, 4) !== '0000') {
            validChain = false;
            break;
        }

        if (currentBlock.previousBlockHash !== previousBlock.hash) {
            validChain = false;
            break;
        }
    }

    const genesisBlock = blockChain[0];
    const correctNonce = genesisBlock['nonce'] === 100;
    const correctPreviousHash = genesisBlock['previousBlockHash'] === 0;
    const correctHash = genesisBlock['hash'] === 0;
    const correctTransaction = genesisBlock['transactions'].length === 0;

    if (!correctNonce || !correctPreviousHash || !correctHash || !correctTransaction) {
        validChain = false;
    }

    return validChain;
};

_blockchain.prototype.getBlock = function (blockHash) {
    return this.chain.find(block => {
        return block.hash === blockHash;
    });
};

_blockchain.prototype.getTransaction = function (transactionId) {
    const block = this.chain.find(block =>
        block.transactions.find(transaction => transaction.transactionId === transactionId)
    );

    const transaction = block?.transactions.find(transaction => transaction.transactionId === transactionId);

    return {
        block: block
            ? {
                  index: block.index,
                  timestamp: block.timestamp,
                  nonce: block.nonce,
                  hash: block.hash,
                  previousBlockHash: block.previousBlockHash,
              }
            : null,
        transaction: transaction ? transaction : null,
    };
};

_blockchain.prototype.getAddressData = function (address) {
    const transactions = this.chain
        .flatMap(block => block.transactions)
        .filter(transaction => transaction.sender === address || transaction.recipient === address);

    let balance = 0;
    transactions.forEach(transaction => {
        balance = transaction.sender === address ? balance - transaction.amount : balance + transaction.amount;
    });

    return { addressTransactions: transactions, addressBalance: balance };
};

module.exports = _blockchain;
