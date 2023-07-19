const express = require('express');
const bodyParser = require('body-parser');

export const server = express();
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: false }));

const port = 3000;

server.get('/', function (req, res) {
    res.json({ api: 'pool_chain-api', version: '2023_07_001' });
});

server.listen(port, function () {
    console.log(`Listening on port ${port}...`);
});
