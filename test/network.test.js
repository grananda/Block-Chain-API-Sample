import { describe, expect, it } from 'vitest';
import supertest from 'supertest';
import { fakerEN } from '@faker-js/faker';
import { app } from '../index.js';

describe('POST /', () => {
    const request = supertest.agent(app.server);

    it('should response 200', async () => {
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
});
