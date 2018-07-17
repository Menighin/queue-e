import LogService from '../services/LogService';

let socket = null;

export default class QueueSocket {

    static setup(io) {
        socket = io.of('/process-progress');
    }

    static update(process, finished = false) {
        if (socket == null) throw new Error("Socket emit called before setup");

        let processUpdateDto = {
            id: process.id,
            name: process.name,
            status: process.status,
            createdOnDate: process.createdOnDate,
            createdOnTime: process.createdOnTime,
            startedOnTime: process.startedOnTime,
            finishedOnTime: process.finishedOnTime,
            progress: process.progress,
            finished: finished,
            errors: process.errors,
            warnings: process.warnings
        };     

        socket.emit('update', processUpdateDto);
    }

    static appendLog(process, log) {
        if (socket == null) throw new Error("Socket emit called before setup");

        let logType = LogService.getLogTypeFrom(log);

        let processDto = {
            id: process.id,
            log: {
                timestamp: log.substring(0, 21),
                message: log.replace(logType, '').substring(22), 
                type: logType === null ? null : logType.replace(/[\[\]]/g,'').toLowerCase()
            }
        };

        socket.emit('appendLog', processDto);
    }
    

}