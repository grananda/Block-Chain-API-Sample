import { describe, it, expect } from 'vitest';
import { networkNodeFactory } from '../../test/factory/network-node.factory';
import { NetworkNode } from './NetworkNode';

describe('NetworkNode', () => {
    describe('init', function () {
        it('should create a network node', () => {
            // Arrange
            const node = networkNodeFactory();

            // Act
            const res = new NetworkNode(node.networkNodeId, node.networkNodeUrl);

            // Assert
            expect(res.networkNodeId).toEqual(node.networkNodeId);
            expect(res.networkNodeUrl).toEqual(node.networkNodeUrl);
        });
    });
});
