import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import supertest from 'supertest';
import { fakerEN } from '@faker-js/faker';
import { app } from '../index.js';
import ip from 'ip';
import { GenericContainer } from 'testcontainers';
import { NetworkNode } from '../src/model/NetworkNode.js';
import axios from 'axios';

describe('NetworkController', () => {
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

    beforeEach(() => {
        app.network.nodes = [container1Node];
    });

    describe('GET /network', () => {
        it('should response with a 200 code when a requesting a node network', async () => {
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
                        networkNodeId: container1Node.networkNodeId,
                        networkNodeUrl: container1Node.networkNodeUrl,
                    },
                ],
            });

            await axios.get(`http://${container1Node.networkNodeUrl}/network`).then(res => {
                expect(res.data).toEqual({
                    currentNode: {
                        networkNodeId: container1Node.networkNodeId,
                        networkNodeUrl: container1Node.networkNodeUrl,
                    },
                    nodes: [],
                });
            });

            await axios.get(`http://${container2Node.networkNodeUrl}/network`).then(res => {
                expect(res.data).toEqual({
                    currentNode: {
                        networkNodeId: container2Node.networkNodeId,
                        networkNodeUrl: container2Node.networkNodeUrl,
                    },
                    nodes: [],
                });
            });
        });
    });

    describe('POST /network/node', () => {
        it('should response with a 200 code when adding a new node to the network', async () => {
            const id = fakerEN.string.uuid();
            const port = fakerEN.number.int({ min: 1000, max: 2000 });
            const ip = `${currentIpAddress}:${port}`;

            const res = await request
                .post('/network/node')
                .send({ networkNodeId: id, networkNodeUrl: ip })
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
                        networkNodeId: id,
                        networkNodeUrl: ip,
                    },
                ].sort(it => it.networkNodeUrl),
            });

            await axios.get(`http://${container1Node.networkNodeUrl}/network`).then(res => {
                expect(res.data).toEqual({
                    currentNode: {
                        networkNodeId: container1Node.networkNodeId,
                        networkNodeUrl: container1Node.networkNodeUrl,
                    },
                    nodes: [],
                });
            });

            await axios.get(`http://${container2Node.networkNodeUrl}/network`).then(res => {
                expect(res.data).toEqual({
                    currentNode: {
                        networkNodeId: container2Node.networkNodeId,
                        networkNodeUrl: container2Node.networkNodeUrl,
                    },
                    nodes: [],
                });
            });
        });
    });

    describe('POST /network/node/bulk', () => {
        it('should response with a 200 code when adding bulk nodes to the network', async () => {
            const id1 = fakerEN.string.uuid();
            const port1 = fakerEN.number.int({ min: 1000, max: 2000 });
            const ip1 = `${currentIpAddress}:${port1}`;

            const id2 = fakerEN.string.uuid();
            const port2 = fakerEN.number.int({ min: 1000, max: 2000 });
            const ip2 = `${currentIpAddress}:${port2}`;

            const res = await request
                .post('/network/node/bulk')
                .send({
                    network: [
                        { networkNodeId: id1, networkNodeUrl: ip1 },
                        { networkNodeId: id2, networkNodeUrl: ip2 },
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
                        networkNodeId: container1Node.networkNodeId,
                        networkNodeUrl: container1Node.networkNodeUrl,
                    },
                    {
                        networkNodeId: id1,
                        networkNodeUrl: ip1,
                    },
                    {
                        networkNodeId: id2,
                        networkNodeUrl: ip2,
                    },
                ].sort(it => it.networkNodeUrl),
            });

            await axios.get(`http://${container1Node.networkNodeUrl}/network`).then(res => {
                expect(res.data).toEqual({
                    currentNode: {
                        networkNodeId: container1Node.networkNodeId,
                        networkNodeUrl: container1Node.networkNodeUrl,
                    },
                    nodes: [],
                });
            });

            await axios.get(`http://${container2Node.networkNodeUrl}/network`).then(res => {
                expect(res.data).toEqual({
                    currentNode: {
                        networkNodeId: container2Node.networkNodeId,
                        networkNodeUrl: container2Node.networkNodeUrl,
                    },
                    nodes: [],
                });
            });
        });
    });

    describe('POST /network/node/broadcast', () => {
        it('should response with a 200 code when broadcasting a new node to the network', async () => {
            const res = await request
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
                ].sort(it => it.networkNodeUrl),
            });

            await axios.get(`http://${container1Node.networkNodeUrl}/network`).then(res => {
                expect(res.data).toEqual({
                    currentNode: {
                        networkNodeId: container1Node.networkNodeId,
                        networkNodeUrl: container1Node.networkNodeUrl,
                    },
                    nodes: [
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
                    ].sort(it => it.networkNodeUrl),
                });
            });
        });
    });
});
