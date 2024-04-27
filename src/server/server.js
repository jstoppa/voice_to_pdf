import cors from 'cors';
import 'dotenv/config';
import express from 'express';
const app = express();
const PORT = 3000;

import Anthropic from '@anthropic-ai/sdk';

app.use(express.json());

app.use(
	cors({
		origin: 'http://localhost:1234',
	})
);

// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Example API endpoint
app.post('/api/completion', async (req, res) => {
	const anthropic = new Anthropic({
		apiKey: process.ANTHROPIC_API_KEY,
	});

	let questions = JSON.stringify(req.body.questions);

	let contextualText = JSON.stringify(req.body.contextualText);

	const response = await anthropic.messages.create({
		model: 'claude-3-opus-20240229',
		max_tokens: 4096,
		temperature: 0,
		system: `You are tasked with assisting in the completion of a PDF questionnaire using a provided JSON dataset. 
		The JSON data includes the following fields for each item: id, question, isValidQuestion and answer.\n
		\n
		Your Specific Duties Include:\n
		\n
		1. Question validation: Form the data for Processing you need to 
		   a. Analyse the "question" field\n
		   b. Determine if the question is valid based on the "isValidQuestion" field\n
		   c. If the question is valid, incorporate the corresponding answer provided in the answer field using the data provided by the user role\n
		2. Strict Adherence to Data: Under no circumstances should you alter, rephrase, or modify any of the the 'question' or 'id' fields, your main task is to populate the 'isValidQuestion' and 'answer' fields\h
		3. Format Requirement: Return the results strictly in JSON format. Ensure that the output contains only the required information, maintaining the integrity and structure of the original JSON, including the content of the 'id' field.\n
		4. Valid Questions: Only return the questions that contain a valid question based on the "isValidQuestion" field but still conserving the value of the original 'id' field\n
		\n
		Important Note: Do not add extraneous text or information outside of the specified JSON structure.\n
		\n
		Data for Processing:\n
		\n
        ${questions}\n
		\n
		Ensure the returned data follows the format for the example below and should be a VALID JSON:\n
		\n
		[{
			"id": 0,
			"question": "First name",
			"isValidQuestion": true,
			"answer": "John"
		},
		{
			"id": 1,
			"question": "Last name",
			"isValidQuestion": true,
			"answer": "Doe"
		}]\n
		`,
		messages: [
			{
				role: 'user',
				content: [
					{
						type: 'text',
						text: `This is the contextual text that you need to use to complete the questionnaire\n\n ${contextualText}`,
					},
				],
			},
		],
	});
	res.json(response);
});

app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
