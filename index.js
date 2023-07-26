import { config } from './src/ config/config.js';
import { ApplicationBootstrap } from './src/application-bootstrap.js';

const port = process.argv[2] ? process.argv[2] : config.ENV !== 'test' ? config.PORT : 0;

export const app = ApplicationBootstrap.getInstance(port).createNetwork().createBlockChain().createServer().start();
