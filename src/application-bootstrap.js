import { Network } from './model/Network.js';
import { NetworkNode } from './model/NetworkNode.js';
import { v4 as uuidv4 } from 'uuid';
import ip from 'ip';
import express from 'express';
import bodyParser from 'body-parser';
import appRoutes from './routes/app.route.js';
import networkRoutes from './routes/network.route.js';
import blockChainRoutes from './routes/block-chain.route.js';
import transactionRoutes from './routes/transaction.route.js';
import { createHttpTerminator } from 'http-terminator';
import { BlockChain } from './model/BlockChain.js';
import { Block } from './model/Block.js';
import { config } from './ config/config.js';

export class ApplicationBootstrap {
    constructor(port = null) {
        this.server = null;
        this.httpTerminator = null;
        this.network = null;
        this.currentNode = null;
        this.blockChain = null;
        this.ip = null;
        this.port = port;
    }

    static getInstance(port) {
        return new ApplicationBootstrap(port);
    }

    createNetwork(currentNode = null) {
        this.ip = config.IP ? config.IP : ip.address();
        this.network = new Network();
        this.currentNode = currentNode ? currentNode : new NetworkNode(uuidv4(), `${this.ip}:${this.port}`);
        this.network.currentNode = this.currentNode;

        return this;
    }

    createBlockChain() {
        this.blockChain = new BlockChain();
        const genesisBlock = new Block();

        this.blockChain.chain.push(genesisBlock);

        return this;
    }

    createServer() {
        this.server = express();

        this.server.use(bodyParser.json());
        this.server.use(bodyParser.urlencoded({ extended: false }));

        this.server.use('/', appRoutes);
        this.server.use('/network', networkRoutes);
        this.server.use('/block-chain', blockChainRoutes);
        this.server.use('/transaction', transactionRoutes);

        return this;
    }

    start() {
        const listener = this.server.listen(this.port, function () {
            console.info(`Application started at ${listener.address().port}...`);
        });

        this.httpTerminator = createHttpTerminator({ server: listener });

        return this;
    }

    async stop() {
        this.httpTerminator.terminate().then(console.info(`Application terminated at ${this.port}`));
    }
}
