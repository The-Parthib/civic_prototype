/*

This is a service for managing civic issues

Algorithm 

we will take images and text or voice input 


we will fetch context clearing question from database

we will send the user input ( images, text, voice ) along with context clearing question to the Gemini API
    prompt =  `User input: ${userInput}, Context clearing question: ${contextQuestion} 
     please tell me which of the questions are not answered by the user input and tell me refined and to the point questions to ask the user to get more clarity on the issue in the format of a json array`



we will process the response from the Gemini API and extract the refined questions

we will return the refined questions to the user
if user answer those questions we will repeat the process until we have enough clarity on the issue at most 1 times 

once we have enough clarity we will fetch municipal structure from database

{
    Municipal : {
    departments : [
       {
          name: "Public Works",
          responsibility: ["Road Maintenance", "Infrastructure Development"],
          department_head_uid: 1,
          staffs : [
                {
                    id: 1,
                    responsibility: ["Road Maintenance"]
                },
                {
                    id: 2,
                    responsibility: ["Infrastructure Development"]
                }
          ]
      }
]
}


we will send the user input ( images, text, voice ) + question answers  along with municipal structure to the Gemini API 
and we will ask the Gemini API to classify the issue and assign it to the correct department and staff

    prompt =  `User input: ${userInput}, Question answers: ${questionAnswers}, Municipal structure: ${municipalStructure} 
     please classify the issue and assign it to the correct department and staff in the format of a json object`

we will process the response from the Gemini API and extract the department and staff details


we will transfer the issue to the respective department and staff 


*/


// import axios from 'axios'
// // const FormData = require('form-data');
// // const fs = require('fs');
// // const path = require('path');
// import readline from 'readline'





// const geminiApiKey = ''

// const GEMINI_API_URL = https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${geminiApiKey}


// async function GeminiCall(prompt) {
//     try {
//         const response = await axios.post(GEMINI_API_URL, {
//             prompt: {
//                 text: prompt
//             }
//         });
//     } catch (error) {
//         console.error('Error calling Gemini API:', error);
//         throw error;    
//     }
//     return response.data;
// }


// // take input 

// const rl = readline.createInterface({
//   input: process.stdin,   // Read from standard input (keyboard)
//   output: process.stdout  // Write to standard output (console)
// });

// const answer = rl.question("Describe The civic Issue: ", async ( ans) => {
//     return ans;
// })
// const questions = [ "What is the nature of issue? ", "where is the issue located?","is the issue individual problem or mass problem ? "," is this urgent issue or routince civic problem?"]

// const refinedPrompt = `User input : ${answer}, context clearing questions : ${JSON.stringify(questions)}
// please tell me which of the questions are not answered by the user input and give refines questions as a JSON array.`

// const refinedQuestions = await GeminiCall(refinedPrompt) ;




// const municipalStructure = {
//     Municipal : {
//     departments : [
//        {
//           name: "Public Works",
//           responsibility: ["Road Maintenance", "Infrastructure Development"],
//           department_head_uid: 1,
//           staffs : [
//                 {
//                     id: 1,
//                     responsibility: ["Road Maintenance"]
//                 },
//                 {
//                     id: 2,
//                     responsibility: ["Infrastructure Development"]
//                 }
//           ]
//       }
// ]
// }}

// const refinedQuestionANswer = refinedQuestions
// const classificiationPrompt = User input : ${answer} question answer: ${JSON.stringify(refinedQuestionANswer)} municipalStructure : ${municipalStructure} please classify the usse and assign it to the correct department and staff in json
// const classificiation = await GeminiCall(classificiationPrompt) 

// console.log(classificiation)


// To use 'import', add "type": "module" to your package.json file
import axios from 'axios';
import readline from 'readline';
// import dotenv from 'dotenv';

// Load environment variables from a .env file
// dotenv.config();

// --- CONFIGURATION ---
const geminiApiKey = 'AIzaSyDF0hSgycUAPf4i4gHanak1XNqoTk75SAo';
if (!geminiApiKey) {
    console.error("Error: GEMINI_API_KEY not found. Please create a .env file and add your API key.");
    process.exit(1);
}

const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;

const municipalStructure = {
    Municipal: {
        departments: [
            {
                name: "Public Works",
                responsibility: ["Road Maintenance", "Pothole Repair", "Streetlight Repair", "Infrastructure Development"],
                department_head_uid: 1,
                staffs: [
                    { id: 1, responsibility: ["Road Maintenance", "Pothole Repair"] },
                    { id: 2, responsibility: ["Infrastructure Development", "Streetlight Repair"] }
                ]
            },
            {
                name: "Sanitation",
                responsibility: ["Garbage Collection", "Drainage Cleaning", "Public Health"],
                department_head_uid: 2,
                staffs: [
                    { id: 3, responsibility: ["Garbage Collection"] },
                    { id: 4, responsibility: ["Drainage Cleaning"] }
                ]
            }
        ]
    }
};

// --- API CALL FUNCTION ---
async function GeminiCall(prompt) {
    console.log("\n🔄 Calling Gemini API...");
    try {
        const payload = {
            contents: [{
                parts: [{ text: prompt }]
            }],
            // Added safety settings to prevent the API from blocking common civic issue terms
            safetySettings: [
                { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
            ],
            generationConfig: {
                responseMimeType: "application/json", // Request JSON output directly
            },
        };

        const response = await axios.post(GEMINI_API_URL, payload);
        
        // Extract the JSON string from the response
        const jsonText = response.data.candidates[0].content.parts[0].text;
        
        // Parse the JSON string into a JavaScript object
        return JSON.parse(jsonText);

    } catch (error) {
        console.error('Error calling Gemini API:', error.response ? error.response.data : error.message);
        throw error;
    }
}

// --- MAIN APPLICATION LOGIC ---
async function main() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    // Helper function to ask questions using async/await
    const askQuestion = (query) => new Promise(resolve => rl.question(query, resolve));

    try {
        // --- Step 1: Get initial issue and ask clarifying questions ---
        const initialIssue = await askQuestion("🗣 Describe the civic issue: ");

        const initialQuestions = ["What is the nature of the issue?", "Where is the issue located?", "Does the issue affect an individual or a community?", "How urgent is this issue?"];

        const refinementPrompt = `
            User input: "${initialIssue}"
            Context clearing questions: ${JSON.stringify(initialQuestions)}
            
            Based on the user's input, identify which of the context questions remain unanswered. 
            Then, generate a concise list of refined, direct questions to ask the user to get the missing information.
            Return your response as a JSON array of strings. For example: ["What is the exact street address?", "How many households are affected?"]
        `;

        const refinedQuestions = await GeminiCall(refinementPrompt);
        console.log("\n🤖 To better understand, please answer the following:");

        const questionAnswers = {};
        for (const question of refinedQuestions) {
            const answer = await askQuestion(`   - ${question} `);
            questionAnswers[question] = answer;
        }

        // --- Step 2: Classify the issue and assign to staff ---
        const classificationPrompt = `
            User's initial report: "${initialIssue}"
            User's answers to clarifying questions: ${JSON.stringify(questionAnswers)}
            Municipal structure: ${JSON.stringify(municipalStructure)}
            
            Based on all the provided information, classify the issue and assign it to the most appropriate department and staff member.
            Your response must be a single JSON object with the keys "departmentName", "staffId", and a "summary" of the issue.
            For example: {"departmentName": "Public Works", "staffId": 1, "summary": "Pothole reported on Main Street."}
        `;

        const classification = await GeminiCall(classificationPrompt);

        // --- Step 3: Display the result ---
        console.log("\n--- ✅ Issue Classified and Assigned ---");
        console.log(`Department: ${classification.departmentName}`);
        console.log(`Assigned Staff ID: ${classification.staffId}`);
        console.log(`Summary: ${classification.summary}`);
        console.log("---------------------------------------");

    } catch (error) {
        console.error("\nAn error occurred during the process. Please try again.");
    } finally {
        rl.close();
    }
}

// Run the main function
main();