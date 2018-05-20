import fs from 'fs';

class QueueConfiguration {
    constructor() {
        this.configs = JSON.parse(fs.readFileSync('config.json'));
    }

    get(prop) {
        return this.configs[prop];
    }
}

export { QueueConfiguration as default };