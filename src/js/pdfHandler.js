import { PDFDocument } from 'pdf-lib';
const { pdfjsLib } = globalThis;

pdfjsLib.GlobalWorkerOptions.workerSrc =
	'https://cdn.jsdelivr.net/npm/pdfjs-dist/build/pdf.worker.js';

let processDroppedFile = null;

// Function to read the PDF file
async function readPdf(file, fieldsInDocument) {
	processDroppedFile = file;
	const fileReader = new FileReader();
	fileReader.onload = async () => {
		pdfFileArrayBuffer = new Uint8Array(fileReader.result);
		const loadingTask = pdfjsLib.getDocument(pdfFileArrayBuffer);
		try {
			const pdf = await loadingTask.promise;
			const page = await pdf.getPage(1);
			const annotations = await page.getAnnotations();
			annotations.forEach((annotation, index) => {
				fieldsInDocument.push({
					id: index,
					question: annotation.alternativeText,
					fieldName: annotation.fieldName,
					isValidQuestion: false,
					answer: '',
				});
			});

			const canvas = document.createElement('canvas');
			const context = canvas.getContext('2d');
			const viewport = page.getViewport({ scale: 2.0 });
			canvas.height = viewport.height;
			canvas.width = viewport.width;
			const renderContext = {
				canvasContext: context,
				viewport: viewport,
			};
			await page.render(renderContext).promise;
			document.getElementById('pdfDisplay').innerHTML = '';
			if (annotations?.length === 0) {
				const div = document.createElement('div');
				div.classList.add('warning');
				div.style = 'display: block';
				div.innerText =
					'Warning: No form fields found in the PDF. Please try another PDF file.';
				document.getElementById('pdfDisplay').appendChild(div);
			}
			document.getElementById('pdfDisplay').appendChild(canvas);
		} catch (error) {
			console.error('Error loading PDF page:', error);
		}
	};
	fileReader.readAsArrayBuffer(file);
}

// Function to write the PDF file
async function writePdf(answers, fieldsInDocument) {
	const fileReader = new FileReader();
	fileReader.onload = async function () {
		pdfFileArrayBuffer = new Uint8Array(fileReader.result);
		try {
			PDFDocument.load(pdfFileArrayBuffer).then((pdfDoc) => {
				const form = pdfDoc.getForm();
				answers.forEach((answer) => {
					const question = fieldsInDocument.find(
						(q) => q.id === answer.id
					);
					if (question && answer.isValidQuestion) {
						const field = form.getField(question.fieldName);
						if (field?.setText) {
							field.setText(answer.answer);
						}
					}
				});
				// Save the modified PDF as a new file
				pdfDoc.save().then((data) => {
					download(data, 'modified-pdf.pdf', 'application/pdf');
				});
			});
		} catch (error) {
			console.error('Error loading PDF:', error);
		}
	};
	fileReader.readAsArrayBuffer(processDroppedFile);
}

// Function to download the file
function download(data, filename, type) {
	const file = new Blob([data], { type: type });
	if (window.navigator.msSaveOrOpenBlob) {
		// IE10+
		window.navigator.msSaveOrOpenBlob(file, filename);
	} else {
		// Others
		const a = document.createElement('a'),
			url = URL.createObjectURL(file);
		a.href = url;
		a.download = filename;
		document.body.appendChild(a);
		a.click();
		setTimeout(() => {
			document.body.removeChild(a);
			window.URL.revokeObjectURL(url);
		}, 0);
	}
}

export { readPdf, writePdf };
