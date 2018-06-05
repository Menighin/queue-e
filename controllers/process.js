import express from 'express';
import LogService from '../services/LogService';

const router = express.Router();

router.get('/downloadLog', (req, res) => {
    var file = LogService.getLogFilename(req.query.id, req.query.name);
    res.download(file);
});

export default router;