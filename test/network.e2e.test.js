import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import supertest from 'supertest';
import { fakerEN } from '@faker-js/faker';
import { app } from '../index.js';
import { ApplicationBootstrap } from '../src/application-bootstrap.js';

describe('POST /', () => {
    let request;
    let server1;
    let server1Port;

    beforeEach(async () => {
        request = supertest.agent(app.server);

        server1Port = fakerEN.number.int({ min: 1000, max: 2000 });
        server1 = ApplicationBootstrap.getInstance(server1Port).createNetwork().createServer().start();
    });

    afterEach(async () => {
        await server1.stop();
        app.network.nodes = [];
    });

    it('should response with a 200 code when adding a new node to the network', async () => {
        const id = fakerEN.string.uuid();
        const ip = fakerEN.internet.ipv4();

        const res = await request
            .post('/network/node')
            .send({ networkNodeId: id, networkNodeUrl: ip })
            .set('Accept', 'application/json')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200);

        expect(res.body).toMatchObject({
            nodes: [
                {
                    networkNodeId: id,
                    networkNodeUrl: ip,
                },
            ],
        });
    });

    it('should response with a 200 code when adding bulk nodes to the network', async () => {
        const id1 = fakerEN.string.uuid();
        const ip1 = fakerEN.internet.ipv4();

        const id2 = fakerEN.string.uuid();
        const ip2 = fakerEN.internet.ipv4();

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

        expect(res.body).toMatchObject({
            nodes: [
                {
                    networkNodeId: id1,
                    networkNodeUrl: ip1,
                },
                {
                    networkNodeId: id2,
                    networkNodeUrl: ip2,
                },
            ],
        });
    });

    it('should response with a 200 code when broadcasting a new node to the network', async () => {
        const id = fakerEN.string.uuid();
        const ip = `127.0.0.1:${server1Port}`;

        const res = await request
            .post('/network/node/broadcast')
            .send({ networkNodeId: id, networkNodeUrl: ip })
            .set('Accept', 'application/json')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200);

        expect(res.body).toMatchObject({
            nodes: [
                {
                    networkNodeId: id,
                    networkNodeUrl: ip,
                },
            ],
        });
    });
});
