import { config } from './src/ config/config.js';
import { ApplicationBootstrap } from './src/application-bootstrap.js';

const port = process.argv[2] ? process.argv[2] : config.PORT;

export const app = ApplicationBootstrap.getInstance(port).createNetwork().createServer().start();
