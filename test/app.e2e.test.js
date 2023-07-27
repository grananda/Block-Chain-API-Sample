import { beforeEach, describe, expect, it } from 'vitest';
import supertest from 'supertest';
import { config } from '../src/ config/config.js';
import ip from 'ip';
import { app } from '../index.js';

describe('AppController', function () {
    let request;

    beforeEach(() => {
        request = supertest.agent(app.server);
    });
    describe('GET /', () => {
        it('should response 200', async () => {
            const res = await request
                .get('/')
                .set('Accept', 'application/json')
                .expect('Content-Type', 'application/json; charset=utf-8')
                .expect(200);

            expect(res.body).toEqual({
                name: config.NAME,
                version: config.VERSION,
                node: `${ip.address()}:${config.PORT}`,
            });
        });
    });
});
