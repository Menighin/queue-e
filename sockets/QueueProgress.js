let socket = null;

export default class QueueProgress {

    static setup(io) {
        socket = io.of('/queue-progress');
    }

    static update(data) {
        if (socket == null) throw new Error("Socket emit called before setup");
        socket.emit('update', data);
    }

}