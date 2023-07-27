export function BlockChain(chain = [], pendingTransactions = []) {
    this.chain = chain;
    this.pendingTransactions = pendingTransactions;
}

BlockChain.prototype.addBlock = function (block) {
    this.pendingTransactions = [];
    return this.chain.push(block);
};

BlockChain.prototype.getLastBlock = function () {
    return this.chain[this.chain.length - 1];
};

BlockChain.prototype.getBlock = function (blockHash) {
    return this.chain.find(block => {
        return block.hash === blockHash;
    });
};

BlockChain.prototype.attachToPendingTransactions = function (transaction) {
    this.pendingTransactions.push(transaction);

    return this.pendingTransactions.length;
};

BlockChain.prototype.validateChain = function () {
    let validChain = true;

    for (let i = 1; i < this.chain.length; i++) {
        const currentBlock = this.chain[i];
        const previousBlock = this.chain[i - 1];

        const blockHash = currentBlock.hashBlock(
            previousBlock.hash,
            {
                index: currentBlock.index,
                transactions: currentBlock.transactions,
            },
            currentBlock.nonce
        );

        if (!currentBlock.isMined(blockHash) || currentBlock.parentHash !== previousBlock.hash) {
            validChain = false;
            break;
        }
    }

    const genesisBlock = this.chain[0];
    const correctNonce = genesisBlock.nonce === 0;
    const correctPreviousHash = genesisBlock.parentHash === '0000';
    const correctHash = genesisBlock.hash === '0000';
    const correctTransaction = genesisBlock.transactions === null;

    if (!correctNonce || !correctPreviousHash || !correctHash || !correctTransaction) {
        validChain = false;
    }

    return validChain;
};

BlockChain.prototype.findTransactionById = function (transactionId) {
    const transaction = this.chain
        .flatMap(block => block.transactions)
        .find(transaction => transaction.id === transactionId);

    const block = this.chain.find(block => block.index === transaction.containerIndex);

    return {
        block: block
            ? {
                  index: block.index,
                  timestamp: block.timestamp,
                  nonce: block.nonce,
                  parentHash: block.parentHash,
                  hash: block.hash,
              }
            : null,
        transaction: transaction ? transaction : null,
    };
};

BlockChain.prototype.findTransactionsByAddress = function (address) {
    return this.chain
        .flatMap(block => block.transactions)
        .filter(transaction => transaction.sender === address || transaction.recipient === address);
};
