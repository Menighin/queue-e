import express from 'express';
import LogService from '../services/LogService';
import QueueConfigurations from '../utils/QueueConfigurations';
import ProcessService from '../services/ProcessService';
import fs from 'fs';

const router = express.Router();

router.get('/', (req, res) => {

    let processId = req.query.id;
    let process = ProcessService.getProcessById(processId);

    let logFilename = LogService.getLogFilename(req.query.id);

    let logs = [];
    if (fs.existsSync(logFilename))
        logs = fs.readFileSync(logFilename).toString();

    res.render('process', {
        title: 'Queue',
        process,
        logs
    });
});

router.get('/downloadLog', (req, res) => {
    let file = LogService.getLogFilename(req.query.id);
    res.download(file);
});

router.get('/downloadInput', (req, res) => {
    let file = `${QueueConfigurations.get('exe_directory')}\\${req.query.id}_input`;
    res.download(file);
});

export default router;