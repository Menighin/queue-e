import StatusEnum from '../enums/StatusEnum';

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

    get id() { return this._id; }
    set id(id) { this._id = id; }

    get name() { return this._name; }
    set name(name) { this._name = name; }

    get pid() { return this._pid; }
    set pid(pid) { this._pid = pid; }

    get runnable() { return this._runnable; }
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

    get startedOn() { return this._startedOn; }
    set startedOn(startedOn) { this._startedOn = startedOn; }

    get finishedOn() { return this._finishedOn; }
    set finishedOn(finishedOn) { this._finishedOn = finishedOn; }

    get errors() { return this._errors; }
    set errors(errors) { this._errors = errors; }

    get warnings() { return this._warnings; }
    set warnings(warnings) { this._warnings = warnings; }

    get progress() { return this._progress; }
    set progress(progress) { 
        let brackets = progress.match(/\[(.*?)\]/)[1].split('/');
        this._progress = {
            percent: (parseInt(brackets[0] - 1)) / parseInt(brackets[1]),
            nextPercent: (parseInt(brackets[0])) / parseInt(brackets[1]),
            message: progress.split(']')[1]
        };
    }

    get logSize() { return this._logSize; }
    set logSize(logSize) { this._logSize = logSize; }

    get inputSize() { return this._inputSize; }
    set inputSize(inputSize) { this._inputSize = inputSize; }

    get outputSize() { return this._outputSize; }
    set outputSize(outputSize) { this._outputSize = outputSize; }
}

export { Process as default };