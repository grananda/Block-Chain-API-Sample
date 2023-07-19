import { describe, expect, it } from 'vitest';
import { BlockData } from './BlockData';
import { blockDataFactory } from '../../test/factory/block-data.factory';

describe('BlockData', () => {
    describe('init', () => {
        it('a block data is created', () => {
            // Arrange
            const expected = blockDataFactory();

            // Act
            const res = new BlockData(
                expected.id,
                expected.containerIndex,
                expected.sender,
                expected.recipient,
                expected.data
            );

            // Asset
            expect(res).toEqual(expected);
        });
    });
});
