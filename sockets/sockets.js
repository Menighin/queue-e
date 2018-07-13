import QueueSocket from './QueueSocket';
import ProcessSocket from './ProcessSocket';

export default function(io) {
    QueueSocket.setup(io);
    ProcessSocket.setup(io);
}