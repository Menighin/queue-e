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

        if (process.logAll) return `${LogTypeEnum.NONE} ${message}`;

        return null;
    }

    static log(message, process) {

        let m = this.getLogMessage(message, process);

        if (m == null) return;

        let logsDir = QueueConfigurations.get('logs_directory') || 'logs';

        if (!fs.existsSync(logsDir))
            fs.mkdirSync(logsDir);

        fs.appendFile(`${logsDir}\\${process.id}_${process.name}_log.txt`, m, function(err) {
            if (err) throw err;
        });
    }

}

export {LogService as default};