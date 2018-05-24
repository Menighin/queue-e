import express from 'express';
import { spawn } from 'child_process';
import QueueConfigurations from '../utils/QueueConfigurations';
import formidable from 'formidable';

const router = express.Router();

/* GET index page. */
router.get('/', (req, res) => {

    const executablePath = "D:\\Projects\\SolverDummy\\SolverDummy\\bin\\Release\\SolverDummy.exe";

    let queueConfiguration = new QueueConfigurations();

    console.log('QueueConfiguration');
    console.log(queueConfiguration);
    console.log(queueConfiguration.get('exe_directory'));

    console.log('Spawning');
    let p = spawn(executablePath, ['5']);

    console.log('PID: ' + p.pid);

    p.stdout.on('data', (data) => console.log(data.toString()));

    res.render('index', {
        title: 'Queue'
    });
});

router.post('/', (req, res) => {
    let queueConfiguration = new QueueConfigurations();
    let dir = queueConfiguration.get('exe_directory');
    let exe = req.fields.exe || 'SolverDummy';

    try {
        let p = spawn(`${dir}\\${exe}`, ['15']);
        p.stdout.on('data', (data) => console.log(data.toString()));
    } catch(e) {
        console.error(e);
    }

    res.write('Hi!');

});


export default router;