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

    static add(name, runnable, parameters, logAll, id = new Date().getTime()) {

        this.readParameters();

        let myProcess = new Process(id, name, runnable, parameters, logAll);

        _queue[id] = myProcess;
        
        // If is running in parallel or it is the only queued proccess
        if (_runInParallel || Object.keys(_queue).length == 1) {
            this.run(id);
        }

        if (_lastQueue != null)
            _lastQueue.next = id;
        _lastQueue = _queue[id];

        QueueSocket.add(myProcess);
    }

    static run(id) {
        let self = this;
        let myProcess = _queue[id];
        myProcess.startedOn = new Date().getTime();

        let p = spawn(myProcess.runnable, myProcess.parameters);
        myProcess.pid = p.pid;
        myProcess.status = StatusEnum.RUNNING;

        LogService.log('Started running', myProcess);

        p.stdout.on('data', (dataByte) => {
            let data = dataByte.toString().split('\n');
            console.log(data);

            data.forEach(d => {
                if (d.length === 0 || d === '\r' || d === '\n') return;
                
                LogService.log(d, myProcess);
                myProcess.updateWithMessage(d);
                // Emmit event to update queue status
                if (d.indexOf(MessageTypeEnum.UPDATE) !== -1) {
                    myProcess.progress = d.substring(d.indexOf(MessageTypeEnum.UPDATE)).replace(MessageTypeEnum.UPDATE, '');
                    QueueSocket.update(myProcess);
                }
            });
            
        });

        p.on('exit', (code) => {
            console.log('Process finished: ' + code);
            self.finished(id, code);
            QueueSocket.update(myProcess, true);
        });
    }

    static finished(id, code) {
        let finished = _queue[id];
        finished.finishedOn = new Date().getTime();

        if (code === 0)
            finished.status = StatusEnum.FINISHED;
        else
            finished.status = StatusEnum.ERROR;

        this.updateFilesSize(finished);
        this.writeProcess(finished);

        let next = finished.next;

        delete _queue[id];
        if (next != null && !_runInParallel)
            this.run(next);
    }

    static updateFilesSize(myProcess) {
        let logFilename = LogService.getLogFilename(myProcess.id, myProcess.name);
        if (fs.existsSync(logFilename)) {
            let stats = fs.statSync(logFilename);
            myProcess.logSize = FileSystemUtils.sizeToString(stats['size']);
        }
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
        let processFilename = `${processDirectory}\\${Process.getFileName(processId)}`;

        let id = new Date().getTime();
        let process = Object.assign(new Process(), JSON.parse(fs.readFileSync(processFilename)));

        // Copy input file with new name
        let inputName = `${QueueConfigurations.get('exe_directory')}\\${id}_input`;
        let oldInputFile = `${QueueConfigurations.get('exe_directory')}\\${process.id}_input`;

        if (fs.existsSync(oldInputFile))
            fs.createReadStream(oldInputFile)
                .pipe(fs.createWriteStream(inputName));

        this.add(process.name, process.runnable, process.parameters, process.logAll, id);
    }

    static writeProcess(process) {
        let processDirectory = QueueConfigurations.get('process_directory');

        if (!fs.existsSync(processDirectory))
            fs.mkdirSync(processDirectory);
        
        fs.writeFileSync(`${processDirectory}\\${Process.getFileName(process.id)}`, JSON.stringify(process));
    }
}

export { QueueService as default };