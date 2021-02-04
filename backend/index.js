'use strict';
var __createBinding = (this && this.__createBinding) || (Object.create ? (function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  Object.defineProperty(o, k2, { enumerable: true, get: function () { return m[k]; } });
}) : (function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function (o, v) {
  Object.defineProperty(o, 'default', { enumerable: true, value: v });
}) : function (o, v) {
  o['default'] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
  if (mod && mod.__esModule) return mod;
  var result = {};
  if (mod != null) for (var k in mod) if (k !== 'default' && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
  __setModuleDefault(result, mod);
  return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
  return (mod && mod.__esModule) ? mod : { 'default': mod };
};
Object.defineProperty(exports, '__esModule', { value: true });
var express_1 = __importDefault(require('express'));
var cors_1 = __importDefault(require('cors'));
var http_1 = require('http');
var socket_io_1 = require('socket.io');
var users_1 = require('./utils/users');
var redis_db_1 = require('./redis/redis-db');
// import { IUser } from './utils/users';
// import { GameState } from './utils/game';
// eslint-disable-next-line @typescript-eslint/no-var-requires
var dotenv = __importStar(require('dotenv'));
dotenv.config({ path: __dirname + '/.env' });
var app = express_1.default();
app.use(cors_1.default());
var httpServer = http_1.createServer(app);
var PORT = process.env.PORT || 3002;
var io = new socket_io_1.Server(httpServer, {
  cors: { origin: 'http://localhost:3000', methods: ['GET', 'POST'] }
});
var welcomeMessage = 'Welcome';
io.on('connection', function (socket) {
  console.log('server connected');
  socket.on('joinRoom', function (_a) {
    var username = _a.username, room = _a.room;
    var user = users_1.userJoin(socket.id, username, room);
    socket.join(user.room);
    // Welcome current user
    socket.emit('joinConfirmation', welcomeMessage + ' ' + username + ', you can start playing now.');
    // Broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit('joinConfirmation', username + ' has joined the game');
  });
  socket.on('onChangeState', function (_a) {
    var newState = _a.newState, fakeUser = _a.fakeUser;
    var user = fakeUser;
    socket.broadcast.to(user.room)
      .emit('updatedState', newState);
    //save to database
    redis_db_1.setState(fakeUser.room, newState);
  });
  socket.on('resumeGame', function (room) {
    welcomeMessage = 'Welcome back';
    redis_db_1.getState(room).then(function (data) { return socket.emit('updatedState', data); });
  });
  // Runs when client disconnects
  socket.on('disconnect', function () {
    console.log('disconnect works');
    var user = users_1.userLeave(socket.id);
    if (user) {
      io.to(user.room).emit('userLeft', user.username + ' has left the game');
    }
  });
});
httpServer.listen(PORT, function () {
  return console.log('Server is listening on port ' + PORT);
});