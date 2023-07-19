import { describe, expect, it } from 'vitest';
import { Block } from './Block';
import sha256 from 'sha256';
import { blockFactory, genesisBlockFactory } from '../../test/factory/block.factory';
import { fakerEN } from '@faker-js/faker';
import { blockDataFactory } from '../../test/factory/block-data.factory';

describe('Block', () => {
    describe('init', () => {
        it('should create a new genesis block', () => {
            // Arrange
            const expected = genesisBlockFactory();

            // Act
            const res = new Block();

            // Asset
            expect(res).toEqual(expected);
        });

        it('should create a new general block', () => {
            // Arrange
            const block = blockFactory();

            // Act
            const res = new Block(block.index, block.nonce, block.parentHash, block.hash, block.transactions);

            // Asset
            expect(res).toEqual(block);
        });
    });

    describe('hashBlock', () => {
        it('should create a block hash', () => {
            // Arrange
            const block = blockFactory(true);
            const hashNonce = fakerEN.number.int();
            const pendingTransactions = [blockDataFactory()];

            const expectedHash = sha256(block.parentHash + hashNonce.toString() + JSON.stringify(pendingTransactions));

            // Act
            const res = block.hashBlock(block.parentHash, pendingTransactions, hashNonce);

            // Asset
            expect(res).toEqual(expectedHash);
        });
    });

    describe('proofOfWork', () => {
        it('should execute a prove of work by finding a nonce for current pending transactions', () => {
            // Arrange
            const pendingTransactions = [blockDataFactory()];

            const block = blockFactory(true);
            // Act
            const res = block.proofOfWork(block.parentHash, pendingTransactions);

            // Asset
            expect(res).toBeDefined();
        });
    });

    describe('isMined', () => {
        it('should set a block as not mined', () => {
            // Arrange
            const hash = fakerEN.git.commitSha();
            const block = new Block();

            // Act
            const res = block.isMined(hash);

            // Asset
            expect(res).toEqual(false);
        });

        it('should set a block as  mined', () => {
            // Arrange
            const hash = '0000' + fakerEN.git.commitSha();
            const block = new Block();

            // Act
            const res = block.isMined(hash);

            // Asset
            expect(res).toEqual(true);
        });
    });
});
