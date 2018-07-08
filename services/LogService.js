import QueueConfigurations from '../utils/QueueConfigurations';
import LogTypeEnum from '../enums/LogTypeEnum';
import MessageTypeEnum from '../enums/MessageTypeEnum';
import fs from 'fs';

class LogService {

    static getLogMessage(message, process) {
        if (message.indexOf(MessageTypeEnum.LOG) !== -1) return message.replace(MessageTypeEnum.LOG, LogTypeEnum.LOG);
        if (message.indexOf(MessageTypeEnum.DEBUG) !== -1) return message.replace(MessageTypeEnum.DEBUG, LogTypeEnum.DEBUG);;
        if (message.indexOf(MessageTypeEnum.WARN) !== -1) return message.replace(MessageTypeEnum.WARN, LogTypeEnum.WARN);;
        if (message.indexOf(MessageTypeEnum.ERROR) !== -1) return message.replace(MessageTypeEnum.ERROR, LogTypeEnum.ERROR);;
        if (message.indexOf(MessageTypeEnum.UPDATE) !== -1) return message.replace(MessageTypeEnum.UPDATE, LogTypeEnum.UPDATE);;

        if (process.logAll) return `${LogTypeEnum.NONE} ${message}`;

        return message;
    }

    static getLogFilename(processId, processName) {
        let logsDir = QueueConfigurations.get('logs_directory') || 'logs';

        if (!fs.existsSync(logsDir))
            fs.mkdirSync(logsDir);
        
        return `${logsDir}\\${processId}_${processName}_log.txt`;
    }


    static log(message, process) {

        let m = this.getLogMessage(message, process);

        if (m == null) return;

        let logFile = this.getLogFilename(process.id, process.name);

        fs.appendFile(logFile, m, function(err) {
            if (err) throw err;
        });
    }

}

export {LogService as default};