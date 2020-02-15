import React, { useRef, useEffect, useState, useCallback } from "react";
import "./App.css";
import WaveSurfer from "wavesurfer.js";

function App() {
  const filenames = ["satc", "boom"];
  return (
    <div className="App">
      {filenames.map(filename => (
        <Waveform key={`waveform-${filename}`} filename={filename} />
      ))}
    </div>
  );
}

function Waveform({ filename }: { filename: string }) {
  const [isCanvasLoaded, setIsCanvasLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isWaveformReady, setIsWaveformReady] = useState(false);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const canvasRef = useCallback(node => {
    if (node !== null) {
      setIsCanvasLoaded(true);
    }
  }, []);
  const id = `canvas-${filename}`;
  useEffect(() => {
    const wavesurferInstance = WaveSurfer.create({
      container: `#${id}`,
      waveColor: "violet",
      progressColor: "purple"
    });
    wavesurferInstance.load(`/audio/${filename}.mp3`);
    wavesurferInstance.on("ready", function() {
      setIsWaveformReady(true);
    });
    wavesurferRef.current = wavesurferInstance;
  }, [filename]);
  const waveform = wavesurferRef.current;
  // if (waveform === null || isWaveformReady === false) return null;
  return (
    <div>
      <h2>{isPlaying}</h2>
      {waveform !== null && (
        <>
          <button
            onClick={() => {
              isPlaying ? waveform.pause() : waveform.play();
              setIsPlaying(waveform.isPlaying());
            }}
          >
            {isPlaying ? "pause" : "play"}
          </button>
          <button
            onClick={() => {
              waveform.stop();
              setIsPlaying(false);
            }}
          >
            stop
          </button>
        </>
      )}
      <div id={id} ref={canvasRef}></div>
    </div>
  );
}

export default App;
