import { beforeEach, describe, expect, it } from 'vitest';
import supertest from 'supertest';
import { app } from '../index.js';
import { networkNodeFactory } from './factory/network-node.factory.js';

describe('NetworkController', () => {
    const request = supertest.agent(app.server);

    beforeEach(() => {
        app.network.nodes = [];
    });

    describe('GET /network', () => {
        it('should response with a 200 code when a requesting a node network', async () => {
            const node = networkNodeFactory();
            app.network.nodes = [node];

            const res = await request
                .get('/network')
                .set('Accept', 'application/json')
                .expect('Content-Type', 'application/json; charset=utf-8')
                .expect(200);

            expect(res.body).toEqual({
                currentNode: {
                    networkNodeId: app.currentNode.networkNodeId,
                    networkNodeUrl: app.currentNode.networkNodeUrl,
                },
                nodes: [
                    {
                        networkNodeId: node.networkNodeId,
                        networkNodeUrl: node.networkNodeUrl,
                    },
                ],
            });
        });
    });

    describe('POST /network/node', () => {
        it('should response with a 200 code when adding a new node to the network', async () => {
            const node = networkNodeFactory();

            const res = await request
                .post('/network/node')
                .send({ networkNodeId: node.networkNodeId, networkNodeUrl: node.networkNodeUrl })
                .set('Accept', 'application/json')
                .expect('Content-Type', 'application/json; charset=utf-8')
                .expect(200);

            expect(res.body).toEqual({
                currentNode: {
                    networkNodeId: app.currentNode.networkNodeId,
                    networkNodeUrl: app.currentNode.networkNodeUrl,
                },
                nodes: [
                    {
                        networkNodeId: node.networkNodeId,
                        networkNodeUrl: node.networkNodeUrl,
                    },
                ].sort(it => it.networkNodeUrl),
            });
        });
    });

    describe('POST /network/node/bulk', () => {
        it('should response with a 200 code when adding bulk nodes to the network', async () => {
            const node1 = networkNodeFactory();
            const node2 = networkNodeFactory();

            const res = await request
                .post('/network/node/bulk')
                .send({
                    network: [
                        {
                            networkNodeId: node1.networkNodeId,
                            networkNodeUrl: node1.networkNodeUrl,
                        },
                        {
                            networkNodeId: node2.networkNodeId,
                            networkNodeUrl: node2.networkNodeUrl,
                        },
                    ],
                })
                .set('Accept', 'application/json')
                .expect('Content-Type', 'application/json; charset=utf-8')
                .expect(200);

            expect(res.body).toEqual({
                currentNode: {
                    networkNodeId: app.currentNode.networkNodeId,
                    networkNodeUrl: app.currentNode.networkNodeUrl,
                },
                nodes: [
                    {
                        networkNodeId: node1.networkNodeId,
                        networkNodeUrl: node1.networkNodeUrl,
                    },
                    {
                        networkNodeId: node2.networkNodeId,
                        networkNodeUrl: node2.networkNodeUrl,
                    },
                ].sort(it => it.networkNodeUrl),
            });
        });
    });
});
