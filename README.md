# 🎨 Real-Time Collaborative Whiteboard

A real-time collaborative whiteboard built using React, Node.js and Socket.IO that allows multiple users to draw together in shared rooms with live cursor tracking and basic drawing tools.
## Setup Instructions
### Prerequisites:

Make sure you have the following installed:

Node.js

npm
#### 1. Clone the Repository
git clone <(https://github.com/Arghamita08/real-time-whiteboard)>

cd real-time-whiteboard
#### 2. Start the Backend(Socket Server)
cd whiteboard-server

npm install

node index.js

Server will start on:

http://localhost:5000


One must see:
Whiteboard server running on port 5000

#### 3. Start the Frontend (React App)

Open a new terminal:

cd whiteboard-client
npm install
npm start


Frontend will run on:

http://localhost:3000
### How to Test with Multiple Users

One can test real-time collaboration in multiple ways:

One way is Multiple Browser Tabs

Open two or more tabs

Go to http://localhost:3000

Use the same Room ID & password

Enter different usernames
What one must See:

Other users’ drawings appear in real time

Live cursor indicators with usernames

Online user list updates instantly

Undo affects everyone
### Features Implemented:

Brush & Eraser tools

Color picker & stroke width

Real-time multi-user drawing

Live cursor tracking

Room creation with password protection

Global undo

Download canvas as PNG

Online user list with indicators
## Known Limitations

Redo is not fully implemented yet

Clear canvas is local-only

No persistent storage

Heavy drawing may cause slight lag

### Time Spent on the Project:

Planning & UI Design: 3–4 hours

Socket.IO Architecture:	3 hours

Drawing Logic & Canvas:	4–5 hours

Real-time Sync & Cursor Tracking:	3 hours

Debugging & Edge Cases:	3 hours

Documentation	30 minutes
