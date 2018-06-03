import express from 'express';
import { spawn } from 'child_process';
import http from 'http';
import io from 'socket.io';
import QueueConfigurations from '../utils/QueueConfigurations';
import QueueService from '../services/QueueService';
import ProcessService from '../services/ProcessService';
import LogService from '../services/LogService';
import formidable from 'formidable';

const router = express.Router();

/* GET index page. */
router.get('/', (req, res) => {
   
    let processes = ProcessService.getAllProcesses();

    res.render('index', {
        title: 'Queue',
        processes
    });
});

router.get('/test', (req, res) => {
    var file = 'D:\\Projects\\queue_logs\\1527778661680_TestDummy_log.txt';
    res.download(file); // Set disposition and send it.
});


router.post('/', (req, res) => {
    let dir = QueueConfigurations.get('exe_directory');
    let program = req.body.program;
    let name = req.body.name;
    let logAll = req.body.logAll === 'true';
    let parameters = req.body.parameters.split(',');

    let runnable = `${dir}\\${program}`;

    QueueService.add(name, runnable, parameters, logAll);

    res.json({success: true});
});

export default router;