import fs from 'fs';

class QueueConfiguration {
    static get(prop) {
        let configs = JSON.parse(fs.readFileSync('config.json'));
        return configs[prop];
    }
}

export { QueueConfiguration as default };