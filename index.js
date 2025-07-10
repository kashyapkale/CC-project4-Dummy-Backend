// index.js
// A simple Express.js server to create dummy APIs for the AI Lecture Assistant project.

// --- Setup ---
// 1. Make sure you have Node.js installed.
// 2. Create a new folder for your server.
// 3. Inside the folder, run `npm init -y` to create a package.json file.
// 4. Run `npm install express cors` to install the required libraries.
// 5. Create a file named `index.js` and paste this code into it.
// 6. Run `node index.js` in your terminal to start the server.
// The server will be running at http://localhost:8080

const express = require('express');
const cors = require('cors');
const crypto = require('crypto'); // Used to generate unique IDs

const app = express();
const PORT = process.env.PORT || 8080;

// --- Middleware ---
// Enable CORS for all routes to allow your frontend to connect
app.use(cors());
// Enable express to parse raw text bodies, as required by the /uploadTranscript endpoint
app.use(express.text());


// --- In-Memory "Database" ---
// This object will store our dummy data. In a real application, this would be a database like RDS.
let lectures = [
    {
        lecture_id: "10e51729-b2ae-489a-b88e-206e898fab41",
        title: "CloudLecture V8",
        // In a real app, this would be a real pre-signed URL. Here, it's just a dummy link.
        notes: "https://example.com/notes/cloud-lecture-v8.txt"
    },
    {
        lecture_id: "139c2798-2c3b-486a-9113-af9fcf13841c",
        title: "cloudLecture4",
        notes: "https://example.com/notes/cloud-lecture-4.txt"
    },
    {
        lecture_id: "a2b1e8d0-5c6f-4a7b-9d8e-1f2a3b4c5d6e",
        title: "Pokemon TestLecture V3",
        notes: "https://example.com/notes/pokemon-lecture-v3.txt"
    },
    {
        lecture_id: "f1e2d3c4-b5a6-7890-1234-567890abcdef",
        title: "Pokemon TestLecture V7",
        notes: "https://example.com/notes/pokemon-lecture-v7.txt"
    },
];


// --- API Endpoints ---

// 1. List Available Lectures and Notes
// Mimics: GET https://4xoppvn7g2.execute-api.us-east-2.amazonaws.com/prod/listLectures
app.get('/listLectures', (req, res) => {
    console.log(`GET /listLectures - Returning ${lectures.length} lectures.`);
    res.status(200).json({
        lectures: lectures
    });
});

// 2. Upload Lecture Transcript
// Mimics: POST https://b9hgm6nhc2.execute-api.us-east-2.amazonaws.com/prod/uploadTranscript?lectureTitle=<title>
app.post('/uploadTranscript', (req, res) => {
    const { lectureTitle } = req.query;
    const transcriptText = req.body;

    if (!lectureTitle || !transcriptText) {
        console.error('POST /uploadTranscript - Failed: Missing lectureTitle or transcript body.');
        return res.status(400).json({ message: "Bad Request: 'lectureTitle' query parameter and a raw text body are required." });
    }

    console.log(`POST /uploadTranscript - Received title: ${lectureTitle}`);
    console.log(`Transcript content (first 50 chars): "${transcriptText.substring(0, 50)}..."`);

    const newLecture = {
        lecture_id: crypto.randomUUID(),
        title: lectureTitle,
        // We'll generate a dummy notes URL. The processing is just simulated.
        notes: `https://example.com/notes/${lectureTitle.replace(/\s+/g, '-')}.txt`
    };

    // Add the new lecture to our in-memory list
    lectures.push(newLecture);

    // Respond with a success message similar to the original API
    res.status(200).json({
        lecture_id: newLecture.lecture_id,
        transcript_uri: `s3://dummy-bucket/transcripts/${newLecture.lecture_id}.txt`,
        message: "Transcript uploaded and processing triggered."
    });
});


// 3. Course FAQ Chat Endpoint
// Mimics: POST https://16ea96uy70.execute-api.us-east-2.amazonaws.com/prod/qa?q=<question>
app.post('/qa', (req, res) => {
    const { q } = req.query;

    if (!q) {
        console.error('POST /qa - Failed: Missing question.');
        return res.status(400).json({ message: "Bad Request: 'q' query parameter is required." });
    }

    console.log(`POST /qa - Received question: "${q}"`);

    let answer = "I'm sorry, I don't have an answer for that. I am a simple dummy bot. Please try asking about the TA or the late submission penalty.";

    // Simple logic to answer questions from your report's screenshot
    const question = q.toLowerCase();
    if (question.includes('ta of this course')) {
        answer = "Jyothi (Email: jyothi2215@vt.edu) is the GTA (Graduate Teaching Assistant) of this course. Note: GTA is often used interchangeably with TA, but technically GTA stands for Graduate Teaching Assistant.";
    } else if (question.includes('late penalty') || question.includes('late submission')) {
        answer = "Late submissions are penalized by 5% project points for every 12 hours late, up to a maximum of 48 hours late. Project submissions that are 48+ hours past the deadline are not accepted unless explicit permission is given by the instructor.";
    }

    // The original API's response format isn't specified, so we'll send the answer as a simple text response.
    // You can wrap it in a JSON object if your frontend expects that, e.g., res.json({ answer: answer });
    res.status(200).send(answer);
});


// --- Start Server ---
app.listen(PORT, () => {
    console.log(`Dummy API server is running on http://localhost:${PORT}`);
    console.log('Available endpoints:');
    console.log(`  GET  http://localhost:${PORT}/listLectures`);
    console.log(`  POST http://localhost:${PORT}/uploadTranscript?lectureTitle=YourTitle`);
    console.log(`  POST http://localhost:${PORT}/qa?q=YourQuestion`);
});

