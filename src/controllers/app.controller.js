import { config } from '../ config/config.js';
import ip from 'ip';

export default class AppController {
    get(req, res) {
        return res.json({ name: config.NAME, version: config.VERSION, node: `${ip.address()}:${config.PORT}` });
    }
}
