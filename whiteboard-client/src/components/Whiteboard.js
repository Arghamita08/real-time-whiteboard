import React, { useRef, useEffect, useState, useCallback } from 'react';
import socket from '../socket';
import Toolbar from './Toolbar';

const Whiteboard = () => {
    const [isAuthenticated, setIsAuthenticated]=useState(false);
    const [roomData, setRoomData]=useState({ name: '', password: '', username: '' });
    const [users, setUsers]=useState([]);
    const [cursors, setCursors]=useState({}); 
    const [tool, setTool]=useState('brush');
    const [color, setColor]=useState('#000000');
    const [width, setWidth]=useState(5);
    const [isDrawing, setIsDrawing]=useState(false);
    const [history, setHistory]=useState([]);

    const canvasRef=useRef(null);
    const startPos=useRef({ x: 0, y: 0 });
    const currentPath=useRef([]);

    const drawOnCanvas=useCallback((ctx, data) => {
        if(!data) return;
        ctx.strokeStyle=data.type==='eraser'?'#ffffff':data.color;
        ctx.lineWidth=data.width;
        ctx.lineCap='round';
        ctx.lineJoin='round';
        ctx.beginPath();
        if(data.type==='brush' || data.type==='eraser' || data.type==='line'){
            ctx.moveTo(data.x0, data.y0); 
            ctx.lineTo(data.x1, data.y1);
        }else if(data.type==='rect'){
            ctx.strokeRect(data.x0, data.y0, data.x1-data.x0, data.y1-data.y0);
        } else if (data.type==='circle'){
            const r=Math.sqrt(Math.pow(data.x1-data.x0, 2)+Math.pow(data.y1-data.y0, 2));
            ctx.arc(data.x0, data.y0, r, 0, 2*Math.PI);
        }
        ctx.stroke();
    }, []);

    const redrawCanvas=useCallback((actions, preview = null) => {
        const canvas=canvasRef.current; 
        if(!canvas) return;
        const ctx=canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        actions.forEach(group => {
            if(Array.isArray(group)){
                group.forEach(item => drawOnCanvas(ctx, item));
            } else if(group && typeof group === 'object') {
                drawOnCanvas(ctx, group);
            }
        });
        if(preview) drawOnCanvas(ctx, preview);
    }, [drawOnCanvas]);

    useEffect(() => {
        socket.on('joinedSuccessfully', () => setIsAuthenticated(true));
        
        socket.on('history', (serverHistory) => {
            const safeHistory = Array.isArray(serverHistory)
    ? serverHistory.filter(item => Array.isArray(item))
    : [];
  setHistory(safeHistory);
        });

        socket.on('drawing', (newPath) => {
            const dataToPush = Array.isArray(newPath) ? newPath : [newPath];
            setHistory(prev => [...prev, dataToPush]);
        });

        socket.on('mouseUpdate', (data) => {
            setCursors(prev => ({ ...prev, [data.id]: data }));
        });
        
        socket.on('userUpdate', (userList) => setUsers(userList));
        socket.on('errorMsg', (msg) => alert(msg));

        return () => { 
            socket.off('joinedSuccessfully');
            socket.off('history');
            socket.off('drawing');
            socket.off('mouseUpdate');
            socket.off('userUpdate'); 
            socket.off('errorMsg');
        };
    }, []);

    useEffect(() => { 
        if(isAuthenticated) redrawCanvas(history); 
    }, [history, isAuthenticated, redrawCanvas]);

    const handleMouseDown = (e) => {
        setIsDrawing(true);
        startPos.current={ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };
        currentPath.current=[];
    };

    const handleMouseMove = (e) => {
        const cur={ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };
        
        socket.emit('mouseMove', { 
            roomId: roomData.name, 
            username: roomData.username, 
            x: cur.x, 
            y: cur.y 
        });

        if(!isDrawing) return;

        if(tool==='brush' || tool==='eraser'){
            const seg={ x0: startPos.current.x, y0: startPos.current.y, x1: cur.x, y1: cur.y, color, width, type: tool };
            currentPath.current.push(seg);
            drawOnCanvas(canvasRef.current.getContext('2d'), seg);
            startPos.current=cur;
        }else{
            redrawCanvas(history, { x0: startPos.current.x, y0: startPos.current.y, x1: cur.x, y1: cur.y, color, width, type: tool });
        }
    };

    const handleMouseUp = (e) => {
        if(!isDrawing) return;
        setIsDrawing(false);

        let newAction = [];
        if(tool==='brush' || tool==='eraser'){
            newAction=currentPath.current;
        }else{
            const shape={ x0: startPos.current.x, y0: startPos.current.y, x1: e.nativeEvent.offsetX, y1: e.nativeEvent.offsetY, color, width, type: tool };
            newAction=[shape];
        }

        socket.emit('drawing', { roomId: roomData.name, path: newAction });
       setHistory(prev => [...prev, newAction]);
    };

    const undo = () => socket.emit('undo', roomData.name);

    const download = () => {
        const canvas=canvasRef.current;
        const temp=document.createElement('canvas');
        temp.width=canvas.width; temp.height = canvas.height;
        const tCtx=temp.getContext('2d');
        tCtx.fillStyle='#fff'; tCtx.fillRect(0,0,temp.width,temp.height);
        tCtx.drawImage(canvas, 0, 0);
        const link=document.createElement('a');
        link.download=`whiteboard-${roomData.name}.png`; 
        link.href=temp.toDataURL(); 
        link.click();
    };

    if(!isAuthenticated) return <AuthScreen socket={socket} setRoomData={setRoomData} />;

    return (
        <div style={{ display: 'flex', height: '100vh', background: '#2c3e50', overflow: 'hidden' }}>
            <div style={{ width: '220px', background: '#1a252f', padding: '20px', color: '#fff', borderRight: '1px solid #34495e' }}>
                <h3 style={{ borderBottom: '1px solid #34495e', paddingBottom: '10px' }}>Online Users</h3>
                {users.map(u => (
                    <div key={u.id} style={{ padding: '8px 0', display: 'flex', alignItems: 'center' }}>
                        <span style={{ height: '8px', width: '8px', background: '#2ecc71', borderRadius: '50%', marginRight: '10px' }}></span>
                        {u.username} {u.id === socket.id ? "(You)" : ""}
                    </div>
                ))}
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
                <Toolbar 
                    tool={tool} setTool={setTool} 
                    color={color} setColor={setColor} 
                    width={width} setWidth={setWidth} 
                    undo={undo} redo={() => {}} 
                    clear={() => socket.emit('clear', roomData.name)} 
                    download={download} 
                />
                
                <div style={{ position: 'relative' }}>
                    <canvas 
                        ref={canvasRef} 
                        onMouseDown={handleMouseDown} 
                        onMouseMove={handleMouseMove} 
                        onMouseUp={handleMouseUp} 
                        width={900} height={600} 
                        style={{ background: '#fff', borderRadius: '10px', cursor: 'crosshair', boxShadow: '0 0 20px rgba(0,0,0,0.4)' }} 
                    />

                    {Object.values(cursors).map(c => (
                        c.id !== socket.id && (
                            <div key={c.id} style={{
                                position: 'absolute',
                                left: c.x,
                                top: c.y,
                                pointerEvents: 'none',
                                transition: 'all 0.05s linear',
                                zIndex: 10
                            }}>
                                <span style={{ fontSize: '20px' }}>📍</span>
                                <div style={{ background: 'rgba(0,0,0,0.8)', color: 'white', fontSize: '11px', padding: '2px 6px', borderRadius: '4px' }}>
                                    {c.username}
                                </div>
                            </div>
                        )
                    ))}
                </div>
            </div>
        </div>
    );
};

const AuthScreen = ({ socket, setRoomData }) => {
    const [form, setForm]=useState({ name: '', password: '', username: '' });
    const [mode, setMode]=useState('create');

    const handleJoin = () => {
        if(!form.name || !form.password || !form.username){
            alert("All fields are required");
            return;
        }

        socket.emit('joinRoom', { 
            roomId: form.name, 
            password: form.password, 
            username: form.username, 
            isCreating: mode === 'create' 
        });
        setRoomData(form);
    };

    const authInput={
        width: '100%',
        padding: '12px',
        marginBottom: '15px',
        borderRadius: '10px',
        border: '1px solid #ddd',
        boxSizing: 'border-box'
    };

    const authBtn={
        width: '100%',
        padding: '12px',
        background: '#667eea',
        color: '#fff',
        border: 'none',
        borderRadius: '10px',
        cursor: 'pointer',
        fontWeight: 'bold'
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #667eea, #764ba2)'
        }}>
            <div style={{
                background: '#fff',
                padding: '40px',
                borderRadius: '24px',
                textAlign: 'center',
                width: '360px'
            }}>
                <h1 style={{ marginBottom: '10px' }}>🎨 CollabBoard</h1>

                <input
                    placeholder="Display Name"
                    style={authInput}
                    onChange={e => setForm({ ...form, username: e.target.value })}
                />

                <input
                    placeholder="Room ID"
                    style={authInput}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                />

                <input
                    placeholder="Password"
                    type="password"
                    style={authInput}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                />

                <button style={authBtn} onClick={handleJoin}>
                    {mode === 'create' ? 'Create & Enter' : 'Join Room'}
                </button>

                <p style={{ marginTop: '20px', fontSize: '14px' }}>
                    {mode === 'create' ? "Already have a room?" : "Need a new room?"}
                    <span
                        style={{
                            cursor: 'pointer',
                            color: '#667eea',
                            marginLeft: '5px'
                        }}
                        onClick={() => setMode(mode === 'create' ? 'join' : 'create')}
                    >
                        {mode === 'create' ? 'Join instead' : 'Create one'}
                    </span>
                </p>
            </div>
        </div>
    );
};

export default Whiteboard;