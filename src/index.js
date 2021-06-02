const express = require('express');
const path = require('path');
const Filter = require('bad-words');
const port = process.env.PORT || 3000;
const http = require('http');
const app = express();
const socketio = require('socket.io');
const server = http.createServer(app);
const io = socketio(server);
const { generateMessage, generateLocationMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom, getActiveRooms } = require('./utils/users');

app.use(express.static(path.join(__dirname, '../public')));

io.on('connection', (socket) => {
	//User join room logic
	socket.on('join', ({ username, room }, cb) => {
		const { error, user } = addUser({ id: socket.id, username, room });

		if (error) {
			return cb(error);
		}

		socket.join(user.room);
		socket.emit('message', generateMessage('Welcome!'));
		socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined!`));

		io.to(user.room).emit('roomData', {
			room: user.room,
			users: getUsersInRoom(user.room)
		});
		cb();
	});

	//active rooms
	io.emit('activeRooms', {
		rooms: getActiveRooms()
	});

	//User sending message logic
	socket.on('sendMessage', (message, cb) => {
		const user = getUser(socket.id);
		const filter = new Filter();
		if (filter.isProfane(message)) {
			return cb('Profanity is not allowed');
		}
		io.to(user.room).emit('message', generateMessage(user.username, message));
		cb();
	});

	//User sending location logic
	socket.on('sendLocation', ({ latitude, longitude }, cb) => {
		const user = getUser(socket.id);
		io
			.to(user.room)
			.emit(
				'locationMessage',
				generateLocationMessage(user.username, `https://google.com/maps?q=${latitude},${longitude}`)
			);
		cb('Location is shared');
	});

	//User disconnecting logic
	socket.on('disconnect', () => {
		const user = removeUser(socket.id);
		if (user) {
			io.to(user.room).emit('message', generateMessage(`${user.username} has left the chat`));
			io.to(user.room).emit('roomData', {
				room: user.room,
				users: getUsersInRoom(user.room)
			});
		}
	});
});

server.listen(port, () => {
	console.log(`Server started at ${port}`);
});
