import { beforeEach, describe, expect, it } from 'vitest';
import supertest from 'supertest';
import { app } from '../index.js';

describe('GET /', () => {
    let request;

    beforeEach(() => {
        request = supertest.agent(app.server);
    });

    it('should response 200', async () => {
        const res = await request
            .get('/block-chain')
            .set('Accept', 'application/json')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200);

        expect(res.body).toEqual(app.blockChain);
    });
});
