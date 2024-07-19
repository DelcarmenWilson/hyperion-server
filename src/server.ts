import http from 'http';
import express from 'express';
import { ServerSocket } from './socket';

const application = express();

/** Server Handling */
const httpServer = http.createServer(application);

/** Start Socket */
new ServerSocket(httpServer);

/** Log the request */
application.use((req, res, next) => {
    console.info(`METHOD: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}]`);

    res.on('finish', () => {
        console.info(`METHOD: [${req.method}] - URL: [${req.url}] - STATUS: [${res.statusCode}] - IP: [${req.socket.remoteAddress}]`);
    });

    next();
});

/** Parse the body of the request */
application.use(express.urlencoded({ extended: true }));
application.use(express.json());

/** Rules of our API */
application.use((req, res, next) => {
<<<<<<< HEAD
    res.header('Access-Control-Allow-Origin', 'https://hperioncrm.com');
    res.setHeader("Access-Control-Allow-Origin", 'https://hperioncrm.com');
=======
    res.header('Access-Control-Allow-Origin', '*');
>>>>>>> zustand
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    if (req.method == 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }

    next();
});

application.get('/', (req, res, next) => {
    return res.status(200).json({ hello: 'Entry point working fine!' });
});

application.get('/socket', (req, res, next) => {
    return res.status(200).json({ hello: 'Entry point working fine!' });
});

application.post('/message', async (req, res, next) => {
    const {userId}=await req.body
    ServerSocket.instance.MessageRecieved(userId)
    return res.status(200).json({ hello: 'messageRecieved' });
});

/** Healthcheck */
application.get('/ping', (req, res, next) => {
    return res.status(200).json({ hello: 'world!' });
});

/** Socket Information */
application.get('/status', (req, res, next) => {
    return res.status(200).json({ users: ServerSocket.instance.users });
});

/** Error handling */
application.use((req, res, next) => {
    const error = new Error('Not found');

    res.status(404).json({
        message: error.message
    });
});

/** Listen */
httpServer.listen(4000, () => console.info(`Server is running`));