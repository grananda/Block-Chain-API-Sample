export function Network(currentNode = null, nodes = []) {
    this.currentNode = currentNode;
    this.nodes = [];

    nodes.map(it => this.addNode(it));
}

Network.prototype.addNode = function (node) {
    if (this.nodes.indexOf(node) === -1 && this.currentNode !== node) {
        this.nodes.push(node);

        return true;
    }

    return false;
};
