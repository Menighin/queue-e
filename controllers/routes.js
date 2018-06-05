import home from './home';
import queue from './queue';
import process from './process'

export default function(app) {
    app.use('/', home);
    app.use('/queue', queue);
    app.use('/process', process);
};
