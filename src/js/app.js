import { setupDragAndDrop } from './dragDrop';
import { writePdf } from './pdfHandler';
import {
	setupSpeechRecognition,
	startRecognition,
	stopRecognition,
} from './speechRecognition';

// DOM elements
const dropArea = document.getElementById('dropArea');
const downloadBtn = document.getElementById('downloadBtn');
const recordBtn = document.getElementById('recordBtn');
const voiceTextDisplay = document.getElementById('voiceTextDisplay');
const spinner = document.getElementById('loadingSpinner');

// Variables
let fieldsInDocument = [];
let isRecording = false;

// Initialize functionality
function init() {
	if (setupSpeechRecognition(voiceTextDisplay)) {
		alert(
			'Your browser does not support speech recognition. Please try Google Chrome.'
		);
		return;
	}

	setupDragAndDrop(dropArea, fieldsInDocument);
	setupDownloadButton();
	setupRecordButton();
}

// Function to setup the record button
function setupRecordButton() {
	recordBtn.addEventListener('click', () => {
		if (!isRecording) {
			startRecognition();
			recordBtn.textContent = 'Stop Recording';
			recordBtn.style.backgroundColor = 'red';
		} else {
			stopRecognition();
			recordBtn.textContent = 'Start Recording';
			recordBtn.style.backgroundColor = '#007bff';
		}
		isRecording = !isRecording;
	});
}

// Function to setup the download button
function setupDownloadButton() {
	downloadBtn.addEventListener('click', async () => {
		try {
			const questionsWithoutCoordinates = fieldsInDocument.map((q) => ({
				id: q.id,
				question: q.question,
				isValidQuestion: q.isValidQuestion,
				answer: q.answer,
			}));
			spinner.style.display = 'flex';
			downloadBtn.disabled = true;
			const data = await callLlm({
				questions: questionsWithoutCoordinates,
				contextualText: voiceTextDisplay.innerText,
			});
			const answers = data?.content[0]?.text;
			if (answers) {
				const answerJSON = JSON.parse(answers);
				if (answerJSON) {
					await writePdf(answerJSON, fieldsInDocument);
				}
			}
		} catch (error) {
			console.error('Error during PDF modification:', error);
		} finally {
			spinner.style.display = 'none';
			downloadBtn.disabled = false;
		}
	});
}

// Function to call the LLM API
async function callLlm(apiPaylod) {
	const response = await fetch('http://localhost:3000/api/completion', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(apiPaylod),
	});
	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}
	return await response.json();
}

// Initialize the app
init();
