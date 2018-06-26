let socket = null;

export default class QueueSocket {

    static setup(io) {
        socket = io.of('/queue-progress');
    }

    static add(process) {
        if (socket == null) throw new Error("Socket emit called before setup");
        socket.emit('add', process);
    }

    static update(process, finished = false) {
        if (socket == null) throw new Error("Socket emit called before setup");

        let processUpdateDto = {
            id: process.id,
            name: process.name,
            status: process.status,
            finishedOn: process.finishedOn,
            progress: process.progress,
            finished: finished
        };     

        socket.emit('update', processUpdateDto);
    }

}