import { fakerEN } from '@faker-js/faker';
import { networkNodeFactory } from './network-node.factory';
import { Network } from '../../src/model/Network';

export const networkFactory = (object = false) => {
    const nodes = Array(fakerEN.number.int({ min: 2, max: 5 })).map(() => networkNodeFactory(object));
    const currentNode = nodes[Math.floor(Math.random() * nodes.length)];

    return object ? new Network(nodes, currentNode) : { nodes: nodes, currentNode: currentNode };
};
