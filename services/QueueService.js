import QueueConfigurations from '../utils/QueueConfigurations';
import { spawn } from 'child_process';
import StatusEnum from '../enums/StatusEnum';
import Process from '../models/Process';

let _runInParallel = false;
let _queue = {};
let _lastQueue = null;

class QueueService {

    static get queue() { return _queue; }
    static get isAsync() { return _async; }

    static readParameters() {
        _runInParallel = QueueConfigurations.get('runInParallel') || false;
    }

    static add(name, runnable, parameters) {

        this.readParameters();

        let now = new Date().getTime();

        let process = new Process(now, name, runnable, parameters);

        _queue[now] = process;
        
        // If is running in parallel or it is the only queued proccess
        if (_runInParallel || Object.keys(_queue).length == 1) {
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
        process.status = StatusEnum.RUNNING;

        p.stdout.on('data', (data) => console.log(data.toString()));
        p.on('exit', (code) => self.finished(id, code));

    }

    static finished(id, code) {
        let finished = _queue[id];

        let next = finished.next;

        delete _queue[id];
        if (next != null && !_runInParallel)
            this.run(next);
    }
}

export { QueueService as default };