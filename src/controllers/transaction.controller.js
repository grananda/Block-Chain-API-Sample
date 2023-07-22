import { app } from '../../index.js';
import { BlockData } from '../model/BlockData.js';
import uuid from 'uuid';
import axios from 'axios';

export default class TransactionController {
    post(req, res) {
        const transaction = req.body;

        const blockIndex = app.blockChain.attachToPendingTransactions(transaction);

        res.send({ transactionsLength: blockIndex });
    }

    broadcast(req, res) {
        const transaction = new BlockData(
            uuid.v4().split('-').join(''),
            null,
            req.body.sender,
            req.body.recipient,
            req.body.data
        );
        const blockIndex = app.blockChain.attachToPendingTransactions(transaction);

        const regNodesPromises = [];
        app.network.nodes.forEach(node => {
            regNodesPromises.push(axios.post(`${node.networkNodeUrl}/transaction`, { transaction }));
        });

        Promise.all(regNodesPromises).then(() => {
            res.json({ blockIndex: blockIndex, pendingTransactions: app.blockChain.pendingTransactions });
        });
    }

    get(req, res) {
        const transactionId = req.params['transactionId'];

        const transaction = app.blockChain.findTransactionById(transactionId);

        res.json(transaction);
    }

    findByAddress(req, res) {
        const address = req.params['address'];

        const addressDate = app.blockChain.findTransactionsByAddress(address);

        res.json({ addressDate: addressDate });
    }
}
