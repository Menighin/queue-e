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

    

}