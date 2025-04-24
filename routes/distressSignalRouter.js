const express = require('express');
const distressSignalController = require('../controllers/distressSignalController');
const userAuthentication = require('../middlewares/userAuthentication');
const twilioClient = require('../middlewares/twilio');
const distressSignalRouter = express.Router();

distressSignalRouter.post('/send',userAuthentication, twilioClient,distressSignalController.sendDistressSignal);
distressSignalRouter.get('/get', userAuthentication,distressSignalController.getDistressSignalsByUser);

distressSignalRouter.get('/police', userAuthentication,distressSignalController.nearestPolice);
distressSignalRouter.delete('/deletesignal/:id', userAuthentication,distressSignalController.deleteSignalById);
distressSignalRouter.get('/viewall', userAuthentication,distressSignalController.getDistressSignalsForAdmin);
distressSignalRouter.patch('/resolve', userAuthentication,distressSignalController.resolveDistressSignal);

module.exports = distressSignalRouter;