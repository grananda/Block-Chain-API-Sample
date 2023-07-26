import { NetworkNode } from '../model/NetworkNode.js';
import axios from 'axios';
import { app } from '../../index.js';

export default class NetworkController {
    get(req, res) {
        res.json({
            currentNode: app.network.currentNode,
            nodes: app.network.nodes.sort(it => it.networkNodeUrl),
        });
    }

    broadcast(req, res) {
        const node = new NetworkNode(req.body.networkNodeId, req.body.networkNodeUrl);

        if (app.network.addNode(node)) {
            console.info(
                `POST /network/broadcast: Node ${node.networkNodeId}:${node.networkNodeUrl} registered successfully in host node.`
            );
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
                res.json({
                    currentNode: app.network.currentNode,
                    nodes: app.network.nodes.sort(it => it.networkNodeUrl),
                });
            });
    }

    post(req, res) {
        const node = new NetworkNode(req.body.networkNodeId, req.body.networkNodeUrl);

        if (app.network.addNode(node)) {
            console.info(
                `POST /network/node: Node ${node.networkNodeId}:${node.networkNodeUrl} registered successfully at ${app.currentNode.networkNodeUrl}.`
            );
        }

        res.json({
            currentNode: app.network.currentNode,
            nodes: app.network.nodes.sort(it => it.networkNodeUrl),
        });
    }

    bulk(req, res) {
        const requestNetwork = req.body.network;

        requestNetwork.forEach(it => {
            const node = new NetworkNode(it.networkNodeId, it.networkNodeUrl);

            if (app.network.addNode(node)) {
                console.log(
                    `POST /network/node/bulk: Node ${node.networkNodeId}:${node.networkNodeUrl} registered successfully at ${app.currentNode.networkNodeUrl}.`
                );
            }
        });

        res.json({
            currentNode: app.network.currentNode,
            nodes: app.network.nodes.sort(it => it.networkNodeUrl),
        });
    }
}
