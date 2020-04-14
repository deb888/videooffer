import * as express from 'express';
import { createServer, Server } from 'https';
import * as socketIo from 'socket.io'; // new
import * as fs from 'fs';
export class ChatServer {

    public static readonly PORT:number = 8000;
    private app: express.Application;
    private port: any;
    private server: Server;
    private io: SocketIO.Server;
    private socketsArray = [];

    constructor() {
        this.createApp();
        this.config();
        this.createServer();
        this.sockets();
        this.listen();
    }

    private createApp(): void {
        this.app = express();
        this.app.use(express.static('public'));
    }

    private config(): void {
        this.port = process.env.PORT || ChatServer.PORT;
    }

    private listen(): void {
        const ip="0.0.0.0";
        this.server.listen(this.port,ip,0,() => {
            console.log('Running server on port %s', this.port);
        });

        this.io.on('connection', (socket) => {
            socket.broadcast.emit('add-users', {
                users: [socket.id]
            });

            socket.on('disconnect', () => {
                this.socketsArray.splice(this.socketsArray.indexOf(socket.id), 1);
                this.io.emit('remove-user', socket.id);
            });

            socket.on('make-offer', (data) => {
                socket.to(data.to).emit('offer-made', {
                    offer: data.offer,
                    socket: socket.id
                });
            });

            socket.on('make-answer', (data) => {
                socket.to(data.to).emit('answer-made', {
                    socket: socket.id,
                    answer: data.answer
                });
            });

        });
    }

    private createServer(): void {
        console.log(__dirname) 
        const options = {
            key: fs.readFileSync(__dirname+'/key.pem'),
            cert: fs.readFileSync(__dirname+'/cert.pem')
          };
         
        this.server = createServer(options,this.app);
    }

     
    private sockets(): void {
        this.io = socketIo(this.server, { origins: '*:*'});
    }

    public getApp(): express.Application {
        return this.app;
    }
}