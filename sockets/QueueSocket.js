let socket = null;

export default class QueueSocket {

    static setup(io) {
        socket = io.of('/queue-progress');
    }

    static add(process) {
        if (socket == null) throw new Error("Socket emit called before setup");
        socket.emit('add', process);
    }

}