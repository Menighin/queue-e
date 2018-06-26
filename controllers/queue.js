import express from 'express';
import { spawn } from 'child_process';
import http from 'http';
import io from 'socket.io';
import QueueConfigurations from '../utils/QueueConfigurations';
import QueueService from '../services/QueueService';
import ProcessService from '../services/ProcessService';
import LogService from '../services/LogService';

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

    if (req.busboy) {
        req.busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
            console.log('File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype);
            file.on('data', function(data) {
                console.log('File [' + fieldname + '] got ' + data.length + ' bytes');
            });
            file.on('end', function() {
                console.log('File [' + fieldname + '] Finished');
            });
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

            let runnable = `${dir}\\${program}`;

            QueueService.add(name, runnable, parameters, logAll);
        });

        req.pipe(req.busboy);
    }

    res.json({success: true});
});

router.post('/cancel', (req, res) => {
    QueueService.cancelProcess(req.body.id);
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