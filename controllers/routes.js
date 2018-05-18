import home from './home';
import queue from './queue';

export default function(app) {
    app.use('/', home);
    app.use('/queue', queue)
};
