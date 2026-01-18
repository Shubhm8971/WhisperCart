require('dotenv').config();
const llmService = require('./utils/llmService');

async function testIntent() {
    require('dotenv').config();
const llmService = require('./utils/llmService');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function interactiveIntentTest() {
    console.log('--- WhisperCart Interactive Intent Testing ---');
    console.log('Type your shopping request or "exit" to quit.');

    const askQuestion = () => {
        rl.question('\nInput: ', async (text) => {
            if (text.toLowerCase() === 'exit') {
                rl.close();
                return;
            }

            try {
                const result = await llmService.extractIntentWithLLM(text);
                console.log('Result:', JSON.stringify(result, null, 2));
            } catch (error) {
                console.error('Error processing intent:', error.message);
            }
            askQuestion(); // Ask the next question
        });
    };

    askQuestion();
}

interactiveIntentTest();

