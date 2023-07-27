export function Network(currentNode = null, nodes = []) {
    this.currentNode = currentNode;
    this.nodes = [];

    nodes.map(it => this.addNode(it));
}

Network.prototype.addNode = function (node) {
    if (
        this.nodes.findIndex(it => it.networkNodeUrl === node.networkNodeUrl) === -1 &&
        this.currentNode?.networkNodeUrl !== node.networkNodeUrl
    ) {
        this.nodes.push(node);

        return true;
    }

    return false;
};
