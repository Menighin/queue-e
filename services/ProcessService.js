import QueueConfigurations from '../utils/QueueConfigurations';
import QueueService from './QueueService';
import Process from '../models/Process';
import fs from 'fs';

export default class ProcessService {

    /**
     * Returns all the processes finished and the past and currently running
     * ordered by creation date
     */
    static getAllProcesses() {

        let processes = [];

        // Reading finished processes
        let processDirectory = QueueConfigurations.get('process_directory');

        let files = fs.readdirSync(processDirectory);
        files.forEach(file => {
            let obj = JSON.parse(fs.readFileSync(`${processDirectory}\\${file}`, 'utf8'));
            let process = Object.assign(new Process(), obj);
            processes.push(process);
        });

        // Getting queued processes
        Object.values(QueueService.queue).forEach(p => {
            processes.push(p);
        });

        // Sorting
        processes = processes.sort((a, b) => {
            return b.createdOn - a.createdOn;
        });

        return processes;
    }

    static getProcessById(id) {
        let processDirectory = QueueConfigurations.get('process_directory');

        let file = `${processDirectory}\\${Process.getFileName(id)}`;

        // If there's isn't a file for this process, it may be running now. Check the queue.
        if (!fs.existsSync(file)) {
            return QueueService.getProcessById(id);
        }

        let fileObj = JSON.parse(fs.readFileSync(file));

        return Object.assign(new Process(), fileObj);
    }

}