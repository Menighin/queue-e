import QueueConfigurations from '../utils/QueueConfigurations';
import LogTypeEnum from '../enums/LogTypeEnum';
import MessageTypeEnum from '../enums/MessageTypeEnum';
import fs from 'fs';

class LogService {

    static getLogMessage(message, process) {
        if (message.indexOf(MessageTypeEnum.LOG) !== -1) return message.replace(MessageTypeEnum.LOG, LogTypeEnum.LOG);
        if (message.indexOf(MessageTypeEnum.DEBUG) !== -1) return message.replace(MessageTypeEnum.DEBUG, LogTypeEnum.DEBUG);
        if (message.indexOf(MessageTypeEnum.WARN) !== -1) return message.replace(MessageTypeEnum.WARN, LogTypeEnum.WARN);
        if (message.indexOf(MessageTypeEnum.ERROR) !== -1) return message.replace(MessageTypeEnum.ERROR, LogTypeEnum.ERROR);
        if (message.indexOf(MessageTypeEnum.UPDATE) !== -1) return message.replace(MessageTypeEnum.UPDATE, LogTypeEnum.UPDATE);

        if (process.logAll) return `${LogTypeEnum.NONE} ${message}`;

        return message;
    }

    static getMessageTypeFrom(m) {
        if (m.indexOf(MessageTypeEnum.LOG) !== -1) return MessageTypeEnum.LOG;
        if (m.indexOf(MessageTypeEnum.DEBUG) !== -1) return MessageTypeEnum.DEBUG;
        if (m.indexOf(MessageTypeEnum.WARN) !== -1) return MessageTypeEnum.WARN;
        if (m.indexOf(MessageTypeEnum.ERROR) !== -1) return MessageTypeEnum.ERROR;
        if (m.indexOf(MessageTypeEnum.UPDATE) !== -1) return MessageTypeEnum.UPDATE;

        return null;
    }

    static getLogTypeFrom(m) {
        if (m.indexOf(LogTypeEnum.NONE) !== -1) return LogTypeEnum.NONE;
        if (m.indexOf(LogTypeEnum.LOG) !== -1) return LogTypeEnum.LOG;
        if (m.indexOf(LogTypeEnum.DEBUG) !== -1) return LogTypeEnum.DEBUG;
        if (m.indexOf(LogTypeEnum.WARN) !== -1) return LogTypeEnum.WARN;
        if (m.indexOf(LogTypeEnum.ERROR) !== -1) return LogTypeEnum.ERROR;
        if (m.indexOf(LogTypeEnum.UPDATE) !== -1) return LogTypeEnum.UPDATE;

        return null;
    }

    static getLogFilename(processId) {
        let logsDir = QueueConfigurations.get('logs_directory') || 'logs';

        if (!fs.existsSync(logsDir))
            fs.mkdirSync(logsDir);
        
        return `${logsDir}\\${processId}_log.txt`;
    }


    static log(message, process) {

        if (message == null) return;

        let m = `${LogService.getTimestamp()} ${this.getLogMessage(message, process)}\n`;

        if (m == null) return;

        let logFile = this.getLogFilename(process.id);

        fs.appendFileSync(logFile, m);
    }

    static getTimestamp() {
        let now = new Date();

        return `[${now.getFullYear()}-${now.getMonth().toString().padStart(2, '0')}-${now.getDate()}` +
               ` ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}]`;
    }

}

export {LogService as default};