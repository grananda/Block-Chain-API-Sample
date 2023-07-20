import { NetworkNode } from '../model/NetworkNode.js';
import axios from 'axios';
import { app } from '../../index.js';

export default class NetworkController {
    get(req, res) {
        res.json(app.network);
    }

    broadcast(req, res) {
        const node = new NetworkNode(req.body.networkNodeId, req.body.networkNodeUrl);

        if (app.network.addNode(node)) {
            console.log(`Node ${node.networkNodeId} registered successfully.`);
        }

        const responsePromises = [];
        app.network.nodes.forEach(it => {
            responsePromises.push(
                axios.post(`http://${it.networkNodeUrl}/network/node`, {
                    networkNodeId: node.networkNodeId,
                    networkNodeUrl: node.networkNodeUrl,
                })
            );
        });

        Promise.all(responsePromises)
            .then(() => {
                return axios.post(`http://${node.networkNodeUrl}/network/node/bulk`, {
                    network: [...app.network.nodes, app.network.currentNode],
                });
            })
            .then(() => {
                res.json(app.network);
            });
    }

    post(req, res) {
        const node = new NetworkNode(req.body.networkNodeId, req.body.networkNodeUrl);

        if (app.network.addNode(node)) {
            console.log(`Node ${node.networkNodeId} registered successfully.`);
        }

        res.json(app.network);
    }

    bulk(req, res) {
        const requestNetwork = req.body.network;

        requestNetwork.forEach(it => {
            const node = new NetworkNode(it.networkNodeId, it.networkNodeUrl);

            if (app.network.addNode(node)) {
                console.log(`Node ${node.networkNodeId} registered successfully.`);
            }
        });

        res.json(app.network);
    }
}
