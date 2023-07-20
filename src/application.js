import { Network } from './model/Network.js';
import { NetworkNode } from './model/NetworkNode.js';
import { v4 as uuidv4 } from 'uuid';
import ip from 'ip';
import express from 'express';
import bodyParser from 'body-parser';
import appRoutes from './routes/app.route.js';
import networkRoutes from './routes/network.route.js';

export class Application {
    constructor(port = null) {
        this.server = null;
        this.network = null;
        this.currentNode = null;
        this.ip = null;
        this.port = port;
    }

    init() {
        this.server = express();

        this.ip = ip.address();
        this.network = new Network();
        this.currentNode = new NetworkNode(uuidv4(), `${this.ip}:${this.port}`);
        this.network.currentNode = this.currentNode;

        return this;
    }

    configureServer() {
        this.server.use(bodyParser.json());
        this.server.use(bodyParser.urlencoded({ extended: false }));

        this.server.use('/', appRoutes);
        this.server.use('/network', networkRoutes);

        return this;
    }

    start() {
        const listener = this.server.listen(this.port, function () {
            console.info(`Application started ast ${listener.address().port}...`);
        });

        return this;
    }
}
