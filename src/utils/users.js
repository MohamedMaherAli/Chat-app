const users = [];
let rooms = {};

//addUser, removeUser, getUser, getUsersInRoom, getAvticeRooms
const addUser = ({ id, username, room }) => {
	if (!username || !room) {
		return {
			error: 'Username and Room are required!'
		};
	}
	//clean the input
	username = username.trim().toLowerCase();
	room = room.trim().toLowerCase();

	//validate the input
	const exisitingUser = users.find((user) => {
		return user.room === room && user.username === username;
	});

	if (exisitingUser) {
		return {
			error: 'Username is in user'
		};
	}

	//push the user into users array
	const user = { id, username, room };
	users.push(user);
	//return the user
	return { user };
};

const removeUser = (id) => {
	const index = users.findIndex((user) => user.id === id);
	if (index !== -1) {
		// this will return an array of deleted users, in this case it will be an array of one item thats why we acess index 0
		return users.splice(index, 1)[0];
	}
};

const getUser = (id) => {
	const user = users.find((user) => user.id === id);
	return user;
};

const getUsersInRoom = (room) => {
	room = room.trim().toLowerCase();
	return users.filter((user) => user.room === room);
};

const getActiveRooms = () => {
	// rooms is an object map, to avoid rooms dublication
	users.map((user) => {
		if (!rooms[user.room]) {
			rooms[user.room] = user.room;
		}
	});

	//all rooms even inactive ones
	const allRooms = Object.keys(rooms);

	//only rooms that has users in it
	const activeRooms = allRooms.filter((room) => {
		if (getUsersInRoom(room).length > 0) {
			return room;
		}
	});

	return activeRooms;
};

module.exports = {
	addUser,
	removeUser,
	getUser,
	getUsersInRoom,
	getActiveRooms
};
