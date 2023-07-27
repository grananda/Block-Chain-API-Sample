import { beforeEach, describe, expect, it } from 'vitest';
import supertest from 'supertest';
import { app } from '../index.js';
import { transactionFactory } from './factory/transaction.factory.js';
import { blockFactory } from './factory/block.factory.js';
import { blockChainFactory } from './factory/block-chain.factory.js';

describe('TransactionController', () => {
    let request;

    beforeEach(() => {
        request = supertest.agent(app.server);
    });

    describe('POST /transaction', () => {
        it('should response 200', async () => {
            const transaction = transactionFactory();
            const payload = {
                id: transaction.id,
                sender: transaction.sender,
                recipient: transaction.recipient,
                data: transaction.data,
            };

            const res = await request
                .post('/transaction')
                .send(payload)
                .set('Accept', 'application/json')
                .expect('Content-Type', 'application/json; charset=utf-8')
                .expect(200);

            expect(res.body).toEqual({ transactionsLength: 1 });
            expect(app.blockChain.pendingTransactions).toMatchObject([transaction]);
        });
    });

    describe('GET /transaction/address/:address', () => {
        it('should response 200', async () => {
            const transaction1 = transactionFactory();
            const transaction2 = transactionFactory();

            const block1 = blockFactory(true, { transactions: [transaction1] });
            const block2 = blockFactory(true, { transactions: [transaction2] });

            app.blockChain = blockChainFactory(true, { chain: [block1, block2] });

            const res = await request
                .get(`/transaction/address/${transaction1.sender}`)
                .set('Accept', 'application/json')
                .expect('Content-Type', 'application/json; charset=utf-8')
                .expect(200);

            expect(res.body).toEqual([transaction1]);
        });
    });

    describe('GET /transaction/:transactionId', () => {
        it('should response 200', async () => {
            const transaction1 = transactionFactory();
            const transaction2 = transactionFactory();

            const block1 = blockFactory(true, { transactions: [transaction1] });
            const block2 = blockFactory(true, { transactions: [transaction2] });

            transaction1.containerIndex = block1.index;
            transaction2.containerIndex = block2.index;

            app.blockChain = blockChainFactory(true, { chain: [block1, block2] });

            const res = await request
                .get(`/transaction/${transaction1.id}`)
                .set('Accept', 'application/json')
                .expect('Content-Type', 'application/json; charset=utf-8')
                .expect(200);

            expect(res.body).toEqual({
                block: {
                    index: block1.index,
                    timestamp: block1.timestamp,
                    nonce: block1.nonce,
                    parentHash: block1.parentHash,
                    hash: block1.hash,
                },
                transaction: transaction1,
            });
        });
    });
});
