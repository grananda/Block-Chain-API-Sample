import { app } from '../../index.js';
import { BlockData } from '../model/BlockData.js';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

export default class TransactionController {
    post(req, res) {
        const transactionData = req.body;

        const transaction = new BlockData(
            transactionData.id,
            null,
            transactionData.sender,
            transactionData.recipient,
            transactionData.data,
            transactionData.timestamp
        );

        const blockIndex = app.blockChain.attachToPendingTransactions(transaction);

        res.send({ transactionsLength: blockIndex });
    }

    getPendingTransactions(req, res) {
        res.json(app.blockChain.pendingTransactions);
    }

    get(req, res) {
        const transactionId = req.params['transactionId'];

        const transaction = app.blockChain.findTransactionById(transactionId);

        res.json(transaction);
    }

    findByAddress(req, res) {
        const address = req.params['address'];

        const addressDate = app.blockChain.findTransactionsByAddress(address);

        res.json(addressDate);
    }

    broadcast(req, res) {
        const transaction = new BlockData(
            uuidv4().split('-').join(''),
            null,
            req.body.sender,
            req.body.recipient,
            req.body.data
        );
        const blockIndex = app.blockChain.attachToPendingTransactions(transaction);

        const regNodesPromises = [];
        app.network.nodes.forEach(node => {
            if (node.networkNodeId !== app.network.currentNode.id) {
                regNodesPromises.push(
                    axios.post(`http://${node.networkNodeUrl}/transaction`, {
                        id: transaction.id,
                        sender: transaction.sender,
                        recipient: transaction.recipient,
                        data: transaction.data,
                        timestamp: transaction.timestamp,
                    })
                );
            }
        });

        Promise.all(regNodesPromises).then(() => {
            res.json({ blockIndex: blockIndex, pendingTransactions: app.blockChain.pendingTransactions });
        });
    }
}
