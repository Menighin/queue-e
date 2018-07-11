import express from 'express';
import LogService from '../services/LogService';
import QueueConfigurations from '../utils/QueueConfigurations';

const router = express.Router();

router.get('/', (req, res) => {

    let processId = req.query.id;

    res.render('process', {
        title: 'Queue',
    });
});

router.get('/downloadLog', (req, res) => {
    let file = LogService.getLogFilename(req.query.id, req.query.name);
    res.download(file);
});

router.get('/downloadInput', (req, res) => {
    let file = `${QueueConfigurations.get('exe_directory')}\\${req.query.id}_input`;
    res.download(file);
});

export default router;