import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import ip from 'ip';
import { GenericContainer } from 'testcontainers';
import { fakerEN } from '@faker-js/faker';
import axios from 'axios';
import { NetworkNode } from '../src/model/NetworkNode.js';
import { app } from '../index.js';
import supertest from 'supertest';
import { transactionFactory } from './factory/transaction.factory.js';
import { genesisBlockFactory } from './factory/block.factory.js';

describe('Distributed Docker E2E Test', () => {
    let request;
    let currentIpAddress = ip.loopback();

    let container1;
    let container2;
    let container1Node;
    let container2Node;

    beforeAll(async () => {
        const image1 = await GenericContainer.fromDockerfile(__dirname + '/..', 'Dockerfile').build(
            'block-chain-test-1',
            {
                deleteOnExit: true,
            }
        );
        const image2 = await GenericContainer.fromDockerfile(__dirname + '/..', 'Dockerfile').build(
            'block-chain-test-2',
            {
                deleteOnExit: true,
            }
        );
        const server1Port = fakerEN.number.int({ min: 1000, max: 2000 });
        const server2Port = fakerEN.number.int({ min: 1000, max: 2000 });

        container1 = await image1
            .withEnvironment({ PORT: server1Port.toString() })
            .withExposedPorts({
                container: server1Port,
                host: server1Port,
            })
            .start();

        container2 = await image2
            .withEnvironment({ PORT: server2Port.toString() })
            .withExposedPorts({
                container: server2Port,
                host: server2Port,
            })
            .start();

        await axios.get(`http://${currentIpAddress}:${server1Port}/network`).then(res => {
            container1Node = new NetworkNode(res.data.currentNode.networkNodeId, res.data.currentNode.networkNodeUrl);
            app.network.nodes = [container1Node];
        });

        await axios.get(`http://${currentIpAddress}:${server2Port}/network`).then(res => {
            container2Node = new NetworkNode(res.data.currentNode.networkNodeId, res.data.currentNode.networkNodeUrl);
        });

        request = supertest.agent(app.server);
    }, 50000);

    afterAll(async () => {
        await container1.stop();
        await container2.stop();
    });

    describe('POST /network/node/broadcast', () => {
        it('should response with a 200 code when broadcasting a new node to the network', async () => {
            let res = await request
                .post('/network/node/broadcast')
                .send({
                    networkNodeId: container1Node.networkNodeId,
                    networkNodeUrl: container1Node.networkNodeUrl,
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
                        networkNodeId: container1Node.networkNodeId,
                        networkNodeUrl: container1Node.networkNodeUrl,
                    },
                ],
            });

            res = await request
                .post('/network/node/broadcast')
                .send({
                    networkNodeId: container2Node.networkNodeId,
                    networkNodeUrl: container2Node.networkNodeUrl,
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
                        networkNodeId: container1Node.networkNodeId,
                        networkNodeUrl: container1Node.networkNodeUrl,
                    },
                    {
                        networkNodeId: container2Node.networkNodeId,
                        networkNodeUrl: container2Node.networkNodeUrl,
                    },
                ],
            });

            await axios.get(`http://${container1Node.networkNodeUrl}/network`).then(res => {
                expect(res.data).toEqual({
                    currentNode: {
                        networkNodeId: container1Node.networkNodeId,
                        networkNodeUrl: container1Node.networkNodeUrl,
                    },
                    nodes: [
                        {
                            networkNodeId: app.currentNode.networkNodeId,
                            networkNodeUrl: app.currentNode.networkNodeUrl,
                        },
                        {
                            networkNodeId: container2Node.networkNodeId,
                            networkNodeUrl: container2Node.networkNodeUrl,
                        },
                    ],
                });
            });

            await axios.get(`http://${container2Node.networkNodeUrl}/network`).then(res => {
                expect(res.data).toEqual({
                    currentNode: {
                        networkNodeId: container2Node.networkNodeId,
                        networkNodeUrl: container2Node.networkNodeUrl,
                    },
                    nodes: [
                        {
                            networkNodeId: container1Node.networkNodeId,
                            networkNodeUrl: container1Node.networkNodeUrl,
                        },
                        {
                            networkNodeId: app.currentNode.networkNodeId,
                            networkNodeUrl: app.currentNode.networkNodeUrl,
                        },
                    ],
                });
            });
        });
    });

    describe('POST /transaction/broadcast', () => {
        it('should response 200', async () => {
            const transaction = transactionFactory();
            const payload = { sender: transaction.sender, recipient: transaction.recipient, data: transaction.data };

            const res = await request
                .post(`/transaction/broadcast`)
                .send(payload)
                .set('Accept', 'application/json')
                .expect('Content-Type', 'application/json; charset=utf-8')
                .expect(200);

            expect(res.body).toMatchObject({
                blockIndex: 1,
                pendingTransactions: [
                    {
                        ...payload,
                        containerIndex: null,
                    },
                ],
            });

            const resTransaction = res.body.pendingTransactions[0];

            await axios.get(`http://${container1Node.networkNodeUrl}/transaction/pending`).then(res => {
                expect(res.data).toMatchObject([
                    {
                        ...resTransaction,
                    },
                ]);
            });

            await axios.get(`http://${container2Node.networkNodeUrl}/transaction/pending`).then(res => {
                expect(res.data).toMatchObject([
                    {
                        ...resTransaction,
                    },
                ]);
            });
        });
    });

    describe('GET /block-chain/mine', () => {
        it('should return a code 200 when mining last block', async () => {
            const block0 = genesisBlockFactory(true);

            const transaction = transactionFactory();

            app.blockChain.chain = [block0];
            app.blockChain.pendingTransactions = [transaction];

            const res = await request
                .get('/block-chain/mine')
                .set('Accept', 'application/json')
                .expect('Content-Type', 'application/json; charset=utf-8')
                .expect(200);

            expect(res.body).toMatchObject({ index: 1, parentHash: block0.hash, transactions: [transaction] });

            const newBlock = res.body;

            await axios.get(`http://${container1Node.networkNodeUrl}/block-chain`).then(res => {
                expect(res.data).toMatchObject({
                    chain: [
                        {
                            hash: block0.hash,
                            index: block0.index,
                            nonce: block0.nonce,
                            parentHash: block0.parentHash,
                            transactions: block0.transactions,
                        },
                        { ...newBlock },
                    ],
                    pendingTransactions: [],
                });
            });

            await axios.get(`http://${container2Node.networkNodeUrl}/block-chain`).then(res => {
                expect(res.data).toMatchObject({
                    chain: [
                        {
                            hash: block0.hash,
                            index: block0.index,
                            nonce: block0.nonce,
                            parentHash: block0.parentHash,
                            transactions: block0.transactions,
                        },
                        { ...newBlock },
                    ],
                    pendingTransactions: [],
                });
            });
        });
    });

    describe('GET /consensus', () => {
        it('should return a code 200 when consensus', async () => {
            let chain;

            await axios.get(`http://${container1Node.networkNodeUrl}/block-chain`).then(res => {
                chain = res.data.chain;
            });

            app.blockChain.chain = [app.blockChain.chain[0]];
            app.blockChain.pendingTransactions = [];

            const res = await request
                .get('/block-chain/consensus')
                .set('Accept', 'application/json')
                .expect('Content-Type', 'application/json; charset=utf-8')
                .expect(200);

            expect(res.body).toEqual(chain);
        });
    });
});
