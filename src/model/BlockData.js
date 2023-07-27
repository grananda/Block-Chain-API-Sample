export function BlockData(id, containerIndex, sender, recipient, data = {}, timestamp = null) {
    this.id = id;
    this.containerIndex = containerIndex;
    this.timestamp = timestamp ? timestamp : Date.now();
    this.sender = sender;
    this.recipient = recipient;
    this.data = data;
}
