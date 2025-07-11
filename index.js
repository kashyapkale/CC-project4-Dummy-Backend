// index.js
// A simple Express.js server to create dummy APIs for the AI Lecture Assistant project.
// Updated to match the JSON response format of the original Python QA endpoint.

// --- Setup ---
// 1. Make sure you have Node.js installed.
// 2. In your project folder, run `npm install express cors`.
// 3. Create a file named `index.js` and paste this code into it.
// 4. Run `node index.js` in your terminal to start the server.
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
// Enable express to parse JSON bodies, useful for more complex requests
app.use(express.json());


// --- In-Memory "Database" ---
// This object will store our dummy data. In a real application, this would be a database like RDS.
let lectures = [
    {
        lecture_id: "10e51729-b2ae-489a-b88e-206e898fab41",
        title: "CloudLecture V8",
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
app.get('/listLectures', (req, res) => {
    console.log(`GET /listLectures - Returning ${lectures.length} lectures.`);
    res.status(200).json({
        lectures: lectures
    });
});

// 2. Upload Lecture Transcript
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
        notes: `https://example.com/notes/${lectureTitle.replace(/\s+/g, '-')}.txt`
    };

    lectures.push(newLecture);

    res.status(200).json({
        lecture_id: newLecture.lecture_id,
        transcript_uri: `s3://dummy-bucket/transcripts/${newLecture.lecture_id}.txt`,
        message: "Transcript uploaded and processing triggered."
    });
});


// 3. Course FAQ Chat Endpoint
// **MODIFIED** to match the original Python Lambda's response format.
app.post('/qa', (req, res) => {
    const { q } = req.query;

    if (!q) {
        console.error('POST /qa - Failed: Missing question.');
        // The original API returns an 'error' key for failures
        return res.status(400).json({ error: "Query parameter ?q=... is required" });
    }

    console.log(`POST /qa - Received question: "${q}"`);

    let answer = "I don't know. I am a simple dummy bot. Please try asking about the TA or the late submission penalty.";

    const question = q.toLowerCase();
    if (question.includes('ta of this course')) {
        answer = "Jenny (Email: jennymax@vt.edu) is the GTA (Graduate Teaching Assistant) of this course. Note: GTA is often used interchangeably with TA, but technically GTA stands for Graduate Teaching Assistant.";
    } else if (question.includes('late penalty') || question.includes('late submission')) {
        answer = "Late submissions are penalized by 5% project points for every 12 hours late, up to a maximum of 48 hours late. Project submissions that are 48+ hours past the deadline are not accepted unless explicit permission is given by the instructor.";
    }

    // Respond with a JSON object containing the 'answer' key, matching the original API.
    res.status(200).json({ answer: answer });
});


// --- Start Server ---
app.listen(PORT, () => {
    console.log(`Dummy API server is running on http://localhost:${PORT}`);
    console.log('Available endpoints:');
    console.log(`  GET  http://localhost:${PORT}/listLectures`);
    console.log(`  POST http://localhost:${PORT}/uploadTranscript?lectureTitle=YourTitle`);
    console.log(`  POST http://localhost:${PORT}/qa?q=YourQuestion`);
});
