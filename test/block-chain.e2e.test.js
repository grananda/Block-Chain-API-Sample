import { beforeEach, describe, expect, it } from 'vitest';
import supertest from 'supertest';
import { app } from '../index.js';
import { blockFactory, genesisBlockFactory } from './factory/block.factory.js';

describe('BlockChainController', function () {
    let request;

    beforeEach(() => {
        request = supertest.agent(app.server);
    });

    describe('GET /block-chain', () => {
        it('should response 200', async () => {
            const res = await request
                .get('/block-chain')
                .set('Accept', 'application/json')
                .expect('Content-Type', 'application/json; charset=utf-8')
                .expect(200);

            expect(res.body).toEqual(app.blockChain);
        });
    });

    describe('POST /receive-new-block', () => {
        it('should return a code 200 when receiving a new block', async () => {
            const block1 = genesisBlockFactory(true);
            const block2 = blockFactory(true, { index: 1, parentHash: block1.hash });

            app.blockChain.chain = [block1, block2];

            const payload = blockFactory(false, { index: 2, parentHash: block2.hash });

            const res = await request
                .post('/block-chain/receive-new-block')
                .send({ newBlock: payload })
                .set('Accept', 'application/json')
                .expect('Content-Type', 'application/json; charset=utf-8')
                .expect(200);

            expect(res.body).toEqual(payload);
        });
    });
});
