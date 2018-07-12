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
    if (fs.existsSync(logFilename)) {
        let logsStr = fs.readFileSync(logFilename).toString().split('\n');

        logsStr.forEach(l => {
            let logType = LogService.getLogTypeFrom(l);
            logs.push({
                timestamp: l.substring(0, 21),
                message: l.replace(logType, '').substring(22), 
                type: logType === null ? null : logType.replace(/[\[\]]/g,'').toLowerCase()
            });
        });
    }

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