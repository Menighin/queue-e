import QueueConfigurations from '../utils/QueueConfigurations';
import FileSystemUtils from '../utils/FileSystemUtils';
import { spawn } from 'child_process';
import StatusEnum from '../enums/StatusEnum';
import Process from '../models/Process';
import LogService from './LogService';
import QueueSocket from '../sockets/QueueSocket';
import MessageTypeEnum from '../enums/MessageTypeEnum';
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

        let myProcess = new Process(now, name, runnable, parameters, logAll);

        _queue[now] = myProcess;
        
        // If is running in parallel or it is the only queued proccess
        if (_runInParallel || Object.keys(_queue).length == 1) {
            this.run(now);
        }

        if (_lastQueue != null)
            _lastQueue.next = now;
        _lastQueue = _queue[now];

        QueueSocket.add(myProcess);
    }

    static run(id) {
        let self = this;
        let myProcess = _queue[id];
        myProcess.startedOn = new Date().getTime();

        let p = spawn(myProcess.runnable, myProcess.parameters);
        myProcess.pid = p.pid;
        myProcess.status = StatusEnum.RUNNING;

        p.stdout.on('data', (dataByte) => {
            let data = dataByte.toString().split('\n');
            console.log(data);

            data.forEach(d => {
                LogService.log(d, myProcess);
                
                // Emmit event to update queue status
                if (d.indexOf(MessageTypeEnum.UPDATE) !== -1) {
                    myProcess.progress = d.substring(d.indexOf(MessageTypeEnum.UPDATE)).replace(MessageTypeEnum.UPDATE, '');
                    QueueSocket.update(myProcess);
                }
            });
            
        });

        p.on('exit', (code) => {
            console.log('Process finished: ' + code);

            if (code == 0) {
                self.finished(id, code);
                QueueSocket.update(myProcess, true);
            }
        });
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

    static updateFilesSize(myProcess) {
        let logFilename = LogService.getLogFilename(myProcess.id, myProcess.name);
        let stats = fs.statSync(logFilename);
        myProcess.logSize = FileSystemUtils.sizeToString(stats['size']);
    }

    static cancelProcess(processId) {
        let p = _queue[processId];
        
        // Kill running process and starts next
        if (p.status === StatusEnum.RUNNING) {
            process.kill(p.pid, 'SIGKILL');
            if (p.next != null && !_runInParallel)
                this.run(p.next);
        }

        // Remove pointer to this process and point it to next
        if(p.status === StatusEnum.PENDING || p.status === StatusEnum.RUNNING) {
            let beforeProcess = Object.values(_queue).find((process) => process.next == p.id);
            if (beforeProcess !== undefined)
                beforeProcess.next = p.next;
        }

        // Setting process options before writing
        p.status = StatusEnum.CANCELED;
        p.finishedOn = new Date().getTime();

        // Saving and deleting process from queue
        try {
            this.updateFilesSize(p);
            this.writeProcess(p);
            QueueSocket.update(p);
        }
        finally {
            delete _queue[processId];
        }
    }

    static restartOldProcess(processId, processName) {
        let processDirectory = QueueConfigurations.get('process_directory');
        let processFilename = `${processDirectory}\\${processId}_${processName}_process.json`;

        let process = Object.assign(new Process(), JSON.parse(fs.readFileSync(processFilename)));

        this.add(process.name, process.runnable, process.parameters, process.logAll);
    }

    static writeProcess(process) {
        let processDirectory = QueueConfigurations.get('process_directory');

        if (!fs.existsSync(processDirectory))
            fs.mkdirSync(processDirectory);
        
        fs.writeFileSync(`${processDirectory}\\${process.id}_${process.name}_process.json`, JSON.stringify(process));
    }
}

export { QueueService as default };