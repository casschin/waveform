import React, { useRef, useEffect, useState } from "react";
import "./App.css";
import WaveSurfer from "wavesurfer.js";

function App() {
  return (
    <div className="App">
      <Waveform />
      <div id="waveform" />
    </div>
  );
}

function Waveform() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  useEffect(() => {
    const wavesurferInstance = WaveSurfer.create({
      container: "#waveform",
      waveColor: "violet",
      progressColor: "purple"
    });
    wavesurferInstance.load("/audio/satc.mp3");
    wavesurferInstance.on("ready", function() {
      setIsReady(true);
    });
    wavesurferRef.current = wavesurferInstance;
  }, []);
  const waveform = wavesurferRef.current;
  if (waveform === null || isReady === false) return null;
  return (
    <div>
      <h2>{isPlaying}</h2>
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
    </div>
  );
}

export default App;
