let socket = null;

export default class QueueSocket {

    static setup(io) {
        socket = io.of('/queue-progress');
    }

    static update(process, message) {
        if (socket == null) throw new Error("Socket emit called before setup");

        let processUpdateDto = {
            id: process.id,
            status: process.status,
            finishedOn: process.finishedOn,
            progress: process.progress,
            message: message
        };     

        socket.emit('update', processUpdateDto);
    }

}