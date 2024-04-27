const recognition = new webkitSpeechRecognition();
recognition.continuous = true;
recognition.interimResults = true;
recognition.lang = 'en-US';

// Check if browser supports speech recognition
function setupSpeechRecognition(voiceTextDisplay) {
	if (!('webkitSpeechRecognition' in window)) {
		return 'Your browser does not support speech recognition. Please try Google Chrome.';
	} else {
		recognition.onresult = (event) => {
			const transcript = Array.from(event.results)
				.map((result) => result[0].transcript)
				.join('');
			voiceTextDisplay.textContent = transcript;
		};

		recognition.onerror = (event) => {
			console.error('Speech recognition error:', event.error);
		};
	}
}

function startRecognition() {
	recognition.start();
}

function stopRecognition() {
	recognition.stop();
}

export { setupSpeechRecognition, startRecognition, stopRecognition };
