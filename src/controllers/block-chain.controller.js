import { app } from '../../index.js';
import { Block } from '../model/Block.js';
import axios from 'axios';

export default class BlockChainController {
    get(req, res) {
        return res.json(app.blockChain);
    }

    findBlockByHash(req, res) {
        const blockHash = req.params['blockHash'];

        const block = app.blockChain.getBlock(blockHash);

        res.json(block);
    }

    mine(req, res) {
        const lastBlock = app.blockChain.getLastBlock();
        const previousBlockHash = lastBlock.hash;
        const currentBlockData = {
            index: lastBlock['index'] + 1,
            transactions: app.blockChain.pendingTransactions,
        };

        const nonce = lastBlock.proofOfWork(previousBlockHash, currentBlockData);
        const blockHash = lastBlock.hashBlock(previousBlockHash, currentBlockData, nonce);

        const block = new Block(lastBlock['index'] + 1, nonce, previousBlockHash, blockHash, currentBlockData);

        const newBlock = app.blockChain.addBlock(block);

        const regNodesPromises = [];
        app.network.nodes.forEach(node => {
            regNodesPromises.push(axios.post(`${node.networkNodeUrl}/receive-new-block`, { newBlock: newBlock }));
        });

        res.json(newBlock);
    }

    receiveNewBlock(req, res) {
        const newBlock = req.body.newBlock;
        const lastBlock = app.blockChain.getLastBlock();

        const isHashConsistent = lastBlock.hash === newBlock.previousBlockHash;
        const isBlockIndexConsistent = lastBlock['index'] + 1 === newBlock['index'];

        if (isHashConsistent && isBlockIndexConsistent) {
            app.blockChain.addBlock(newBlock);

            res.json(newBlock);
        } else {
            res.json({ error: `Block ${newBlock['index']} rejected.` });
        }
    }

    consensus(req, res) {
        const requestPromises = [];
        app.blockChain.network.nodes.forEach(node => {
            requestPromises.push(axios.get(`${node.networkNodeUrl}/blockchain`));
        });

        Promise.all(requestPromises).then(blockChains => {
            const currentChainLength = app.blockChain.chain.length;

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

            if (newLongestChain && app.blockChain.validateChain(newLongestChain)) {
                app.blockChain.chain = newLongestChain;
                app.blockChain.pendingTransactions = newPendingTransactions;
            }

            res.json(app.blockChain.chain);
        });
    }
}
