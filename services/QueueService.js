import QueueConfiguration from '../utils/QueueConfigurations';
import { spawn } from 'child_process';

let _async = false;
let _queue = {};
let _lastQueue = null;

class QueueService {

    constructor() {
        let queueConfiguration = new QueueConfigurations();
        _async = queueConfiguration.get('runAsync') || false;
    }

    static get queue() { return _queue; }
    static get isAsync() { return _async; }

    static add(runnable, parameters) {

        let now = new Date().getTime();

        let process = {
            id: now,
            runnable: runnable,
            parameters: parameters,
            pid: null,
            status: 'pending',
            next: null
        };

        _queue[now] = process;
        
        // If this is the only object queued, execute it
        if (Object.keys(_queue).length == 1) {
            this.run(now);
        }

        if (_lastQueue != null)
            _lastQueue.next = now;
        _lastQueue = _queue[now];
    }

    static run(id) {
        let self = this;
        let process = _queue[id];

        let p = spawn(process.runnable, process.parameters);
        process.pid = p.pid;
        process.status = 'running';

        p.stdout.on('data', (data) => console.log(data.toString()));
        // p.on('close', (code) => self.finished(id, code));
        p.on('exit', (code) => self.finished(id, code));

    }

    static finished(id, code) {
        let next = _queue[id].next;
        delete _queue[id];
        if (next != null)
            this.run(next);
    }
}

export { QueueService as default };