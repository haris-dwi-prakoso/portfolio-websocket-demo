import { OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway(process.env.WS_PORT ? Number(process.env.WS_PORT) : 4000)
export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private readonly logger = new Logger(AppGateway.name);
    private users = {};

    @WebSocketServer()
    server: Server;

    afterInit() {
        this.logger.log("Websocket initialized");
    }

    handleConnection(client: Socket) {
        if (!this.users[client.id]) this.users[client.id] = client.id;
        this.server.emit('room', `${this.users[client.id]} has entered the room`);
    }

    handleDisconnect(client: Socket) {
        this.server.emit('room', `${this.users[client.id]} has left the room`);
    }

    @SubscribeMessage('customName')
    handleNameChange(client: Socket, message: string) {
        this.server.emit('room', `${this.users[client.id]} has changed their display name to ${message}`);
        this.users[client.id] = message;
    }

    @SubscribeMessage('chat')
    handleMessage(client: Socket, message: string) {
        this.server.emit('room', `[${this.users[client.id]}]: ${message}`);
    }
}