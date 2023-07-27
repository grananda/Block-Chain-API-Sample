const express = require('express');
const bodyParser = require('body-parser');
const request = require('request-promise');
const uuid = require('uuid');
const Blockchain = require('./_blockchain.js');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const nodeAddress = uuid.v4().split('-').join('');
const port = process.argv[2];

const bitcoin = new Blockchain();

app.get('/blockchain', function (req, res) {
    res.send(bitcoin);
});

app.post('/transaction', function (req, res) {
    const newTransaction = req.body;
    const blockIndex = bitcoin.addTransactionToPendingTransactions(newTransaction);

    res.send({ blockIndex: blockIndex });
});

app.post('/transaction/broadcast', function (req, res) {
    const transaction = req.body;
    const newTransaction = bitcoin.createNewTransaction(transaction.amount, transaction.sender, transaction.recipient);
    const blockIndex = bitcoin.addTransactionToPendingTransactions(newTransaction);

    const regNodesPromises = [];
    bitcoin.networkNodes.forEach(networkNodeUrl => {
        const requestOptions = {
            uri: `${networkNodeUrl}/transaction`,
            method: 'POST',
            body: newTransaction,
            json: true,
        };

        regNodesPromises.push(request(requestOptions));
    });

    Promise.all(regNodesPromises).then(data => {
        res.json({ blockIndex: blockIndex, pendingTransactions: bitcoin.pendingTransactions });
    });
});

app.get('/mine', function (req, res) {
    const lastBlock = bitcoin.getLastBlock();
    const previousBlockHash = lastBlock['hash'];
    const currentBlockData = {
        index: lastBlock['index'] + 1,
        transactions: bitcoin.pendingTransactions,
    };

    const nonce = bitcoin.proofOfWork(previousBlockHash, currentBlockData);
    const blockHash = bitcoin.hashBlock(previousBlockHash, currentBlockData, nonce);

    const newBlock = bitcoin.createNewBlock(nonce, previousBlockHash, blockHash);

    const regNodesPromises = [];
    bitcoin.networkNodes.forEach(networkNodeUrl => {
        const requestOptions = {
            uri: `${networkNodeUrl}/receive-new-block`,
            method: 'POST',
            body: { newBlock: newBlock },
            json: true,
        };

        regNodesPromises.push(request(requestOptions));
    });

    Promise.all(regNodesPromises)
        .then(data => {
            const requestOptions = {
                uri: `${bitcoin.currentNodeUrl}/transaction/broadcast`,
                method: 'POST',
                body: {
                    amount: 12.5,
                    sender: '00',
                    recipient: nodeAddress,
                },
                json: true,
            };

            return request(requestOptions);
        })
        .then(data => {
            res.send(newBlock);
        });
});

app.post('/receive-new-block', function (req, res) {
    const newBlock = req.body.newBlock;
    const lastBlock = bitcoin.getLastBlock();

    const isHashConsistent = lastBlock.hash === newBlock.previousBlockHash;
    const isBlockIndexConsistent = lastBlock['index'] + 1 === newBlock['index'];

    if (isHashConsistent && isBlockIndexConsistent) {
        bitcoin.chain.push(newBlock);
        bitcoin.pendingTransactions = [];

        res.json(newBlock);
    } else {
        res.json({ error: `Block ${newBlock['index']} rejected.` });
    }
});

app.get('/consensus', function (req, res) {
    const requestPromises = [];
    bitcoin.networkNodes.forEach(networkNodeUrl => {
        const requestOptions = {
            uri: `${networkNodeUrl}/blockchain`,
            method: 'GET',
            json: true,
        };

        requestPromises.push(request(requestOptions));
    });

    Promise.all(requestPromises).then(blockChains => {
        const currentChainLength = bitcoin.chain.length;

        let maxChainLength = currentChainLength;
        let newLongestChain = null;
        let newPendingTransactions = [];

        blockChains.forEach(blockChain => {
            if (blockChain.chain.length > maxChainLength) {
                maxChainLength = blockChain.chain.length;
                newLongestChain = blockChain.chain;
                newPendingTransactions = blockChain.pendingTransactions;
            }
        });

        if (newLongestChain && bitcoin.chainIsValid(newLongestChain)) {
            bitcoin.chain = newLongestChain;
            bitcoin.pendingTransactions = newPendingTransactions;
        }

        res.json(bitcoin.chain);
    });
});

app.post('/register-and-broadcast-node', function (req, res) {
    const newNodeUrl = req.body.newNodeUrl;
    if (bitcoin.attachNetworkNode(newNodeUrl)) {
        console.log(`Node ${newNodeUrl} registered sucessfully.`);
    }

    const regNodesPromises = [];
    bitcoin.networkNodes.forEach(networkNodeUrl => {
        const requestOptions = {
            uri: `${networkNodeUrl}/register-node`,
            method: 'POST',
            body: { newNodeUrl: newNodeUrl },
            json: true,
        };

        regNodesPromises.push(request(requestOptions));
    });

    Promise.all(regNodesPromises)
        .then(data => {
            const bulkRegisterOptions = {
                uri: `${newNodeUrl}/register-nodes-bulk`,
                method: 'POST',
                body: { allNetworkNodes: [...bitcoin.networkNodes, bitcoin.currentNodeUrl] },
                json: true,
            };

            return request(bulkRegisterOptions);
        })
        .then(data => {
            res.json({ node_networks: bitcoin.networkNodes });
        });
});

app.post('/register-node', function (req, res) {
    const newNodeUrl = req.body.newNodeUrl;
    if (bitcoin.attachNetworkNode(newNodeUrl)) {
        console.log(`Node ${newNodeUrl} registered sucessfully.`);
    }

    res.json({ node_networks: bitcoin.networkNodes });
});

app.post('/register-nodes-bulk', function (req, res) {
    const allNetworkNodes = req.body.allNetworkNodes;
    allNetworkNodes.forEach(networkNodeUrl => {
        if (bitcoin.attachNetworkNode(networkNodeUrl)) {
            console.log(`Node ${networkNodeUrl} registered sucessfully.`);
        }
    });

    res.json({ node_networks: bitcoin.networkNodes });
});

app.get('/block/:blockHash', function (req, res) {
    const blockHash = req.params['blockHash'];

    const block = bitcoin.getLastBlock(blockHash);

    res.json(block);
});

app.get('/transaction/:transactionId', function (req, res) {
    const transactionId = req.params['transactionId'];

    const transaction = bitcoin.getTransaction(transactionId);

    res.json(transaction);
});

app.get('/address/:address', function (req, res) {
    const address = req.params['address'];

    const addressDate = bitcoin.getAddressData(address);

    res.json({ addressDate: addressDate });
});

app.listen(port, function () {
    console.log(`Listening on port ${port}...`);
});
