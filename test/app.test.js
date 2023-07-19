import { describe, expect, it } from 'vitest';
import supertest from 'supertest';
import { server } from '../src/server';

describe('GET /', () => {
    const request = supertest.agent(server);

    it('should response 200', async () => {
        const res = await request
            .get('/')
            .set('Accept', 'application/json')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200);

        expect(res.body).toEqual({ api: 'pool_chain-api', version: '2023_07_001' });
    });
});
