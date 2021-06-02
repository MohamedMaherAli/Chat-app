const socket = io();
const $selectActiveRoomsForm = document.querySelector('#selectActiveRooms');

//templates
const activeRoomTemplate = document.querySelector('#activeRoomsTemplate').innerHTML;

socket.on('activeRooms', (data) => {
	const html = Mustache.render(activeRoomTemplate, {
		rooms: data.rooms
	});
	$selectActiveRoomsForm.innerHTML = html;
});
