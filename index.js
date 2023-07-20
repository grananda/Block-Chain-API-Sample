import { config } from './src/ config/config.js';
import { Application } from './src/application.js';

const port = process.argv[2] ? process.argv[2] : config.PORT;
// export const network = new Network();
// export const currentNode = new NetworkNode(uuidv4(), `${ip.address()}:${port}`);
// network.currentNode = currentNode;

// export const server = express();

// server.use(bodyParser.json());
// server.use(bodyParser.urlencoded({ extended: false }));
//
// server.use('/', appRoutes);
// server.use('/network', networkRoutes);

// class Application {
//     constructor(port = null) {
//         this.network = new Network();
//         this.currentNode = new NetworkNode(uuidv4(), `${ip.address()}:${port}`);
//         this.network.currentNode = currentNode;
//     }
//
//     start() {
//         server.listen(port, function () {
//             console.log(`Listening on port ${this.port}...`);
//         });
//
//         return server;
//     }
// }

export const app = new Application(port);
app.init().configureServer().start();
