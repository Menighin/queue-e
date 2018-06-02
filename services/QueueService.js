import QueueConfigurations from '../utils/QueueConfigurations';
import FileSystemUtils from '../utils/FileSystemUtils';
import { spawn } from 'child_process';
import StatusEnum from '../enums/StatusEnum';
import Process from '../models/Process';
import LogService from './LogService';
import QueueProgress from '../sockets/QueueProgress';
import fs from 'fs';

let _runInParallel = false;
let _queue = {};
let _lastQueue = null;

class QueueService {

    static get queue() { return _queue; }
    static get isAsync() { return _async; }

    static readParameters() {
        _runInParallel = QueueConfigurations.get('runInParallel') || false;
    }

    static add(name, runnable, parameters, logAll) {

        this.readParameters();

        let now = new Date().getTime();

        let process = new Process(now, name, runnable, parameters, logAll);

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
        process.startedOn = new Date().getTime();

        let p = spawn(process.runnable, process.parameters);
        process.pid = p.pid;
        process.status = StatusEnum.RUNNING;

        p.stdout.on('data', (data) => {
            console.log(data.toString());
            LogService.log(data.toString(), process);
            QueueProgress.update(data.toString());
        });
        p.on('exit', (code) => self.finished(id, code));
    }

    static finished(id, code) {
        let finished = _queue[id];
        finished.finishedOn = new Date().getTime();
        finished.status = StatusEnum.FINISHED;

        this.updateFilesSize(finished);
        this.writeProcess(finished);

        let next = finished.next;

        delete _queue[id];
        if (next != null && !_runInParallel)
            this.run(next);
    }

    static updateFilesSize(process) {
        let logFilename = LogService.getLogFilename(process);
        let stats = fs.statSync(logFilename);
        process.logSize = FileSystemUtils.sizeToString(stats['size']);
    }

    static writeProcess(process) {
        let processDirectory = QueueConfigurations.get('process_directory');

        if (!fs.existsSync(processDirectory))
            fs.mkdirSync(processDirectory);
        
        fs.writeFileSync(`${processDirectory}\\${process.id}_${process.name}_process.json`, JSON.stringify(process));
    }
}

export { QueueService as default };