import { beforeEach, describe, expect, it } from 'vitest';
import supertest from 'supertest';
import { app } from '../index.js';
import { transactionFactory } from './factory/transaction.factory.js';

describe('GET /', () => {
    let request;

    beforeEach(() => {
        request = supertest.agent(app.server);
    });

    it('should response 200', async () => {
        const transaction = transactionFactory();

        const res = await request
            .post('/transaction')
            .send(transaction)
            .set('Accept', 'application/json')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200);

        expect(res.body).toEqual({ transactionsLength: 1 });
        expect(app.blockChain.pendingTransactions).toMatchObject([transaction]);
    });
});
