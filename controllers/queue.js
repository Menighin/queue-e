import express from 'express';
import { spawn } from 'child_process';
import http from 'http';
import io from 'socket.io';
import QueueConfigurations from '../utils/QueueConfigurations';
import QueueService from '../services/QueueService';
import ProcessService from '../services/ProcessService';
import LogService from '../services/LogService';
import Process from '../models/Process';
import fs from 'fs';

const router = express.Router();

/* GET index page. */
router.get('/', (req, res) => {
   
    let processes = ProcessService.getAllProcesses();

    res.render('index', {
        title: 'Queue',
        processes
    });
});

router.post('/', (req, res) => {

    let body = {};
    let id = new Date().getTime();
    let inputName = `${id}_input`;

    if (req.busboy) {

        req.busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
            var ws = fs.createWriteStream(`${QueueConfigurations.get('exe_directory')}\\${inputName}`, {flags: "a"});
            file.pipe(ws);
        });

        req.busboy.on('field', function(key, value, keyTruncated, valueTruncated) {
            body[key] = value;
        });

        req.busboy.on('finish', function(){
            let dir = QueueConfigurations.get('exe_directory');
            let program = body.program;
            let name = body.name;
            let logAll = body.logAll === 'true';
            let parameters = body.parameters.split(',');
            parameters.push(inputName);

            let runnable = `${dir}\\${program}`;

            QueueService.add(name, runnable, parameters, logAll, id);
        });

        req.pipe(req.busboy);
    }

    res.json({success: true});
});

router.post('/cancel', (req, res) => {
    QueueService.cancelProcess(req.body.id);
    res.json({success: true});
});

router.post('/restart', (req, res) => {
    QueueService.restartOldProcess(req.body.id, req.body.name);
    res.json({success: true});
});

export default router;