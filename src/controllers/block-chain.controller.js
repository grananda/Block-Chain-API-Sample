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
        const pendingTransactions = app.blockChain.pendingTransactions;
        const nextBlockIndex = lastBlock['index'] + 1;
        const currentBlockData = {
            index: nextBlockIndex,
            transactions: pendingTransactions,
        };

        const nonce = lastBlock.proofOfWork(previousBlockHash, currentBlockData);
        const blockHash = lastBlock.hashBlock(previousBlockHash, currentBlockData, nonce);

        const block = new Block(nextBlockIndex, nonce, previousBlockHash, blockHash, pendingTransactions);

        app.blockChain.addBlock(block);

        const regNodesPromises = [];
        app.network.nodes.forEach(it => {
            regNodesPromises.push(
                axios.post(`http://${it.networkNodeUrl}/block-chain/receive-new-block`, { newBlock: block })
            );
        });

        Promise.all(regNodesPromises).then(() => {
            res.json(block);
        });
    }

    receiveNewBlock(req, res) {
        const newBlock = req.body.newBlock;
        const lastBlock = app.blockChain.getLastBlock();

        const isHashConsistent = lastBlock.hash === newBlock.parentHash;
        const isBlockIndexConsistent = lastBlock['index'] + 1 === newBlock['index'];

        if (!isHashConsistent) {
            res.json({ error: `Block ${newBlock['index']} rejected: Parent block hash does not match` });
        } else if (!isBlockIndexConsistent) {
            res.json({ error: `Block ${newBlock['index']} rejected: Parent block index sequence does not match` });
        } else {
            app.blockChain.addBlock(newBlock);

            res.json(newBlock);
        }
    }

    consensus(req, res) {
        const requestPromises = [];
        app.network.nodes.forEach(node => {
            requestPromises.push(axios.get(`http://${node.networkNodeUrl}/block-chain`));
        });

        Promise.all(requestPromises).then(response => {
            const currentChainLength = app.blockChain.chain.length;

            let maxChainLength = currentChainLength;
            let newLongestChain = null;
            let newPendingTransactions = [];

            response.forEach(blockChain => {
                if (blockChain.data.chain.length > maxChainLength) {
                    maxChainLength = blockChain.data.chain.length;
                    newLongestChain = blockChain.data.chain;
                    newPendingTransactions = blockChain.data.pendingTransactions;
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
