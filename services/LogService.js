import LogTypeEnum from '../enums/LogTypeEnum';
import MessageTypeEnum from '../enums/MessageTypeEnum';

class LogService {

    static getLogType(message) {
        if (message.indexOf(MessageTypeEnum.LOG) !== -1) return LogTypeEnum.LOG;
        if (message.indexOf(MessageTypeEnum.DEBUG) !== -1) return LogTypeEnum.DEBUG;
        if (message.indexOf(MessageTypeEnum.WARN) !== -1) return LogTypeEnum.WARN;
        if (message.indexOf(MessageTypeEnum.ERROR) !== -1) return LogTypeEnum.ERROR;

        return null;
    }

    static log(message, process) {

        let logType = this.getLogType(message);

        if (logType == null && process.logAll) logType = LogTypeEnum.NONE;
        if (logType == null) return;

    }

}

export {LogService as default};