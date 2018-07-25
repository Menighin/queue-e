import StatusEnum from '../enums/StatusEnum';
import LogService from '../services/LogService';
import MessageTypeEnum from '../enums/MessageTypeEnum';

class Process {

    constructor(id, name, runnable, parameters, logAll = false, pid = null, status = StatusEnum.PENDING, next = null) {
        this.id = id;
        this.name = name;
        this.runnable = runnable;
        this.parameters = parameters;
        this.logAll = logAll;
        this.pid = pid;
        this.status = status;
        this.next = next;
        this.createdOn = new Date().getTime();
        this.errors = 0;
        this.warnings = 0;
    }

    static getFileName(id) {
        return id + '_process.json';
    }

    get id() { return this._id; }
    set id(id) { this._id = id; }

    get name() { return this._name; }
    set name(name) { this._name = name; }

    get pid() { return this._pid; }
    set pid(pid) { this._pid = pid; }

    get runnable() { return this._runnable; }
    get runnableName() { 
        let run = this._runnable.split('\\');
        return run[run.length - 1];
    }
    set runnable(runnable) { this._runnable = runnable; }

    get parameters() { return this._parameters; }
    set parameters(parameters) { this._parameters = parameters; }

    get logAll() { return this._logAll; }
    set logAll(logAll) { this._logAll = logAll; }

    get status() { return this._status; }
    set status(status) { this._status = status; }

    get next() { return this._next; }
    set next(next) { this._next = next; }

    get createdOn() { return this._createdOn; }
    set createdOn(createdOn) { this._createdOn = createdOn; }
    get createdOnTime() { return this.formatDateToHour(this._createdOn); }
    get createdOnDate() { return this.formatDate(this._createdOn); }

    get startedOn() { return this._startedOn; }
    set startedOn(startedOn) { this._startedOn = startedOn; }
    get startedOnTime() { return this.formatDateToHour(this._startedOn); }

    get finishedOn() { return this._finishedOn; }
    set finishedOn(finishedOn) { this._finishedOn = finishedOn; }
    get finishedOnTime() { return this.formatDateToHour(this._finishedOn); }

    get errors() { return this._errors; }
    set errors(errors) { this._errors = errors; }

    get warnings() { return this._warnings; }
    set warnings(warnings) { this._warnings = warnings; }

    get progress() { return this._progress; }
    set progress(progress) { 
        let brackets = progress.match(/\[(.*?)\]/)[1].split('/');
        this._progress = {
            step: parseInt(brackets[0]),
            totalSteps: parseInt(brackets[1]),
            message: progress.split(']')[1]
        };

        this.progressHistory = this._progress;
    }

    get progressHistory() { return this._progressHistory; }
    set progressHistory(progress) {
        if (typeof this._progressHistory === 'undefined') {
            this._progressHistory = [];
            for (var i = 0; i < progress.totalSteps; i++)
                this._progressHistory.push({message: null, timestamp: null})
        }
        this._progressHistory[progress.step - 1] = {
            message: progress.message,
            timestamp: new Date().getTime()
        };
    }

    get timeSpent() {
        let start = this.progressHistory[0].timestamp;
        let end = this.finishedOn;
        let diff = end - start;
        let timeSpent = '';

        if (diff >= 1000 * 60 * 60) { // more than hours
            timeSpent += `${parseInt(diff / (1000 * 60 * 60)).toString().padStart('0', 2)}h`;
            diff -= parseInt(diff / (1000 * 60 * 60));
        }

        if (diff >= 1000 * 60) { // more than minutes
            timeSpent += `${parseInt(diff / (1000 * 60)).toString().padStart('0', 2)}m`;
            diff -= parseInt(diff / (1000 * 60));
        }

        timeSpent += `${parseInt(diff / 1000).toString().padStart('0', 2)}s`;

        return timeSpent;

    }

    get logSize() { return this._logSize; }
    set logSize(logSize) { this._logSize = logSize; }

    get inputSize() { return this._inputSize; }
    set inputSize(inputSize) { this._inputSize = inputSize; }

    get outputSize() { return this._outputSize; }
    set outputSize(outputSize) { this._outputSize = outputSize; }


    formatDateToHour(mili) {
        let d = new Date(mili);
        return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    }

    formatDate(mili) {
        let d = new Date(mili);
        return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
    }

    updateWithMessage(m) {
        let messageType = LogService.getMessageTypeFrom(m);
        if (messageType == MessageTypeEnum.ERROR) this.errors++;
        if (messageType == MessageTypeEnum.WARN) this.warnings++;
    }

}

export { Process as default };