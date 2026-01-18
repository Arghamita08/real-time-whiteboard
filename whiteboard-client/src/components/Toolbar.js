import React from 'react';

const Toolbar=({ tool, setTool, color, setColor, width, setWidth, undo, redo, clear, download }) => {
    return(
        <div style={styles.toolbar}>
            <select value={tool} onChange={(e) => setTool(e.target.value)} style={styles.select}>
                <option value="brush">🖌️ Brush</option>
                <option value="line">📏 Line</option>
                <option value="rect">🟦 Rectangle</option>
                <option value="circle">⭕ Circle</option>
                <option value="eraser">🧼 Eraser</option>
            </select>
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} style={styles.color}/>
            <input type="range" min="1" max="50" value={width} onChange={(e) => setWidth(e.target.value)}/>
            <button onClick={undo} style={styles.btn}>Undo</button>
            <button onClick={redo} style={styles.btn}>Redo</button>
            <button onClick={clear} style={styles.clearBtn}>Clear</button>
            <button onClick={download} style={styles.downloadBtn}>💾 Download</button>
        </div>
    );
};

const styles={
    toolbar:{display: 'flex', gap: '15px', padding: '10px 20px', background: '#fff', borderRadius: '50px', marginBottom: '20px', alignItems: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.1)'},
    select:{padding: '5px', borderRadius: '5px'},
    color:{border: 'none', width: '30px', height: '30px', cursor: 'pointer'},
    btn:{padding: '5px 10px', cursor: 'pointer', borderRadius: '5px', border: '1px solid #ddd'},
    clearBtn:{padding: '5px 10px', cursor: 'pointer', borderRadius: '5px', border: 'none', background: '#ff4757', color: 'white'},
    downloadBtn:{padding: '5px 10px', cursor: 'pointer', borderRadius: '5px', border: 'none', background: '#2f3542', color: 'white'}
};

export default Toolbar;