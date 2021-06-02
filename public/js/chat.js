const socket = io();
const $messageForm = document.querySelector('#form-message');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');
const $location = document.querySelector('#location');
const $sidebar = document.querySelector('#sidebar');

//Templates
const messageTemplate = document.querySelector('#messages-template').innerHTML;
const messageLocationTemplate = document.querySelector('#messages-location').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

//Options
const { username, room, activeRooms } = Qs.parse(location.search, { ignoreQueryPrefix: true });

//autoScroll Function
const autoscroll = () => {
	// get the last message
	const newMessage = $messages.lastElementChild;

	// get the height of that message
	const newMessageStyles = getComputedStyle(newMessage);
	const newMessageMargin = parseInt(newMessageStyles.marginBottom);
	const newMesssageHeight = newMessage.offsetHeight + newMessageMargin;

	//visible height
	const visibleHeight = $messages.offsetHeight;

	//container messages height
	const containerHeight = $messages.scrollHeight;

	//how far have i scrolled?
	const scrollOffset = $messages.scrollTop + visibleHeight;

	if (containerHeight - newMesssageHeight <= scrollOffset) {
		$messages.scrollTop = $messages.scrollHeight;
	}
};

socket.on('message', (data) => {
	const html = Mustache.render(messageTemplate, {
		message: data.text,
		createdAt: moment(data.createdAt).format('h:mm a'),
		username: data.username
	});
	$messages.insertAdjacentHTML('beforeend', html);
	autoscroll();
});

socket.on('locationMessage', (data) => {
	const html = Mustache.render(messageLocationTemplate, {
		location: data.text,
		createdAt: moment(data.createdAt).format('h:mm a'),
		username: data.username
	});
	$messages.insertAdjacentHTML('beforeend', html);
	autoscroll();
});

socket.on('roomData', (data) => {
	const html = Mustache.render(sidebarTemplate, {
		room: data.room,
		users: data.users
	});
	$sidebar.innerHTML = html;
});

document.querySelector('#form-message').addEventListener('submit', (e) => {
	e.preventDefault();

	$messageFormButton.setAttribute('disabled', 'disabled');

	socket.emit('sendMessage', $messageFormInput.value, (error) => {
		$messageFormButton.removeAttribute('disabled');
		$messageFormInput.value = '';
		$messageFormInput.focus();

		if (error) {
			return console.log(error);
		}

		console.log('Message was delieverd');
	});
});

$sendLocationButton.addEventListener('click', () => {
	if (!navigator.geolocation) {
		return alert('Your browser doesnt support geolocation feature.');
	}

	$sendLocationButton.setAttribute('disabled', 'disabled');

	navigator.geolocation.getCurrentPosition((position) => {
		console.log(position);
		socket.emit(
			'sendLocation',
			{
				latitude: position.coords.latitude,
				longitude: position.coords.longitude
			},
			(acknowldgementMessage) => {
				console.log(acknowldgementMessage);
				$sendLocationButton.removeAttribute('disabled');
			}
		);
	});
});

socket.emit('join', { username, room }, (err) => {
	if (err) {
		alert(err);
		location.href = '/';
	}
});
