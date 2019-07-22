import React, { useState, useRef } from 'react';
import Editor from 'react-simple-code-editor';
import 'midi/js/midi/player';
import './App.css';

function App() {
  const [tempo, setTempo] = useState(110);
  const [code, setCode] = useState("8e3 8e3 8e3 8e3 8e3 8e3 16e2 16a2 16c3 16e3 8#d3 8#d3 8#d3 8#d3 8#d3 8#d3 16f2 16a2 16c3 16#d3 4d3 8c3 8a2 8c3 4c3 2a2 32a2 32c3 32e3 8a3");

  const regex = /\b((?:32|16|8|4|2|1)\.?)((?:(?:[eb]|#?[acdfg])[1-4])|-)/g

  const highlight = code => code.replace(
    regex, 
    "<span style='color: red;'>$1</span><span style='color: green'>$2</span>"
  )

  const oscillator = useRef(null)

  const play = () => {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    osc.type = 'sawtooth'
    osc.connect(ctx.destination)

    function getFreq(note) {
      if (note.slice(-1) === '-' ) return 0
      const notes = ['c', '#c', 'd', '#d', 'e', 'f', '#f', 'g', '#g', 'a', '#a', 'b']
      const octave = note.slice(-1)
      const key = notes.indexOf(note.slice(0, -1)) + ((octave - 1) * 12)
      return 440 * Math.pow(2, (key-9)/12)
    }

    let time = ctx.currentTime + 0.01
    for ( const note of code.matchAll(regex)) {
      osc.frequency.setTargetAtTime(0, time-0.01, 0.001)
      osc.frequency.setTargetAtTime(getFreq(note[2]), time, 0.001)
      const dot = note[1].slice(-1) === "."
      time += (dot ? 360 : 240) / (tempo * note[1])
    }
    osc.start(0)
    osc.stop(time)
    oscillator.current = osc
  }

  const stop = () => {
    if( oscillator.current ) oscillator.current.stop(0)
  }

  return (
    <div className="App">
      <header className="App-header">
        <Editor
          value={code}
          onValueChange={setCode}
          highlight={highlight}
          padding={10}
          style={{
            fontFamily: '"Fira code", "Fira Mono", monospace',
            fontSize: 17,
            backgroundColor: 'white',
            width: '50%'
          }}
        ></Editor>
        <div>
          Tempo : <input value={tempo} onChange={event => setTempo(event.target.value)}></input>
        </div>
        <button onClick={play}>Play</button>
        <button onClick={stop}>Stop</button>
      </header>
    </div>
  );
}

export default App;
