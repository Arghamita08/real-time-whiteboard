# Architecture Overview

This project uses a client–server architecture where all real-time communication happens through Socket.IO (WebSockets).

## Data Flow Diagram:
User draws on canvas

        ↓
React captures mouse events

        ↓
Drawing data sent via Socket.IO

        ↓
Server broadcasts to room

        ↓
Other clients receive 

        ↓
Canvas redraws instantly

Each drawing action is stored as an object (or array of objects) so it can be replayed later.

## WebSocket Protocol
### Client → Server

joinRoom → Join or create a room

drawing → Send drawing path data

undo → Remove last drawing globally

mouseMove → Send cursor position

clear → Clear canvas (future improvement)

### Server → Client

joinedSuccessfully → Room join confirmation

drawing → Broadcast drawing to others

history → Send full canvas history

userUpdate → Online users list

mouseUpdate → Live cursor positions

errorMsg → Errors like wrong password

## Undo/Redo

The server keeps a single shared history array per room

Each drawing action is stored as one unit

When undo is triggered:

Server removes the last item from history

Updated history is broadcast to all users

All clients redraw the canvas from scratch

### Redo is not implemented yet.

## Performance Decisions

Drawing is sent in small segments instead of full canvas images

Canvas is redrawn only when needed

Mouse cursor updates are lightweight (only x, y, username)

No database used to avoid extra latency

These choices keep the app fast and responsive for small groups.

## Conflict Resolution(Multiple Users Drawing)

Each user draws independently

Server does not block or lock canvas

Drawings are applied in the order received

Overlapping drawings are allowed

This keeps collaboration simple and avoids complex locking logic.
