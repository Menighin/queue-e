import express from 'express';
import { spawn } from 'child_process';
import QueueConfigurations from '../utils/QueueConfigurations';
import QueueService from '../services/QueueService';
import formidable from 'formidable';

const router = express.Router();

/* GET index page. */
router.get('/', (req, res) => {

    const executablePath = "D:\\Projects\\SolverDummy\\SolverDummy\\bin\\Release\\SolverDummy.exe";

    console.log(QueueConfigurations.get('exe_directory'));

    console.log('Spawning');
    let p = spawn(executablePath, ['5']);

    console.log('PID: ' + p.pid);

    p.stdout.on('data', (data) => console.log(data.toString()));

    res.render('index', {
        title: 'Queue'
    });
});

router.post('/', (req, res) => {
    let dir = QueueConfigurations.get('exe_directory');
    let program = req.fields.program;
    let name = req.fields.name;
    let logAll = req.fields.logAll || false;
    let parameters = req.fields.parameters.split(',');

    let runnable = `${dir}\\${program}`;

    QueueService.add(name, runnable, parameters, logAll);

    res.json({success: true});
});


export default router;