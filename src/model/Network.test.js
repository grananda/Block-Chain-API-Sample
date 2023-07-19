import { describe, it, expect } from 'vitest';
import { Network } from './Network';
import { networkNodeFactory } from '../../test/factory/network-node.factory';

describe('Network', () => {
    describe('init', function () {
        it('should create a new network', () => {
            // Arrange
            const nodes = [networkNodeFactory(true)];
            const currentNode = networkNodeFactory(true);

            // Act
            const network = new Network(currentNode, nodes);

            // Assert
            expect(network).toBeTypeOf('object');
            expect(network.nodes.length).toEqual(nodes.length);
            expect(network.nodes).toEqual(nodes);
            expect(network.currentNode).toEqual(currentNode);
        });

        it('should create a new network with repeated nodes', () => {
            // Arrange
            const node = networkNodeFactory(true);
            const currentNode = networkNodeFactory(true);
            const nodes = [node, node];

            // Act
            const network = new Network(currentNode, nodes);

            // Assert
            expect(network).toBeTypeOf('object');
            expect(network.nodes.length).toEqual(1);
            expect(network.nodes).toEqual([node]);
            expect(network.currentNode).toEqual(currentNode);
        });

        it('should create a new network with current node in nodes', () => {
            // Arrange
            const node = networkNodeFactory(true);
            const currentNode = networkNodeFactory(true);
            const nodes = [node, currentNode];

            // Act
            const network = new Network(currentNode, nodes);

            // Assert
            expect(network).toBeTypeOf('object');
            expect(network.nodes.length).toEqual(1);
            expect(network.nodes).toEqual([node]);
            expect(network.currentNode).toEqual(currentNode);
        });
    });

    describe('addNode', function () {
        it('should add an arbitrary node to the network', () => {
            // Arrange
            const node = networkNodeFactory(true);
            const network = new Network();

            // Act
            const res = network.addNode(node);

            // Assert
            expect(res).toEqual(true);
            expect(network.nodes.length).toEqual(1);
            expect(network.nodes).toEqual([node]);
        });

        it('should not add an existing node to the network', () => {
            // Arrange
            const node1 = networkNodeFactory(true);
            const node2 = networkNodeFactory(true);
            const network = new Network();

            network.addNode(node1);
            network.addNode(node2);

            // Act
            const res = network.addNode(node1);

            // Assert
            expect(res).toEqual(false);
            expect(network.nodes.length).toEqual(2);
            expect(network.nodes).toEqual([node1, node2]);
        });

        it('should not add an current node to the network', () => {
            // Arrange
            const node = networkNodeFactory(true);
            const currentNode = networkNodeFactory(true);
            const network = new Network();

            network.addNode(node);
            network.currentNode = currentNode;

            // Act
            const res = network.addNode(currentNode);

            // Assert
            expect(res).toEqual(false);
            expect(network.nodes.length).toEqual(1);
            expect(network.nodes).toEqual([node]);
            expect(network.currentNode).toEqual(currentNode);
        });
    });
});
