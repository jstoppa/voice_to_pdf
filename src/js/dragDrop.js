import { readPdf } from './pdfHandler';

// Function to setup drag and drop functionality
function setupDragAndDrop(dropArea, fieldsInDocument) {
	dropArea.addEventListener('dragover', (e) => {
		e.preventDefault();
		dropArea.style.backgroundColor = '#f0f0f0';
	});

	dropArea.addEventListener('dragleave', () => {
		dropArea.style.backgroundColor = 'transparent';
	});

	dropArea.addEventListener('drop', (e) => {
		e.preventDefault();
		fieldsInDocument.length = 0;
		dropArea.style.backgroundColor = 'transparent';
		readPdf(e.dataTransfer.files[0], fieldsInDocument);
	});
}

export { setupDragAndDrop };
