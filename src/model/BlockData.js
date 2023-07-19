export function BlockData(id, containerIndex, sender, recipient, data = {}) {
    this.id = id;
    this.containerIndex = containerIndex;
    this.timestamp = Date.now();
    this.sender = sender;
    this.recipient = recipient;
    this.data = data;
}
