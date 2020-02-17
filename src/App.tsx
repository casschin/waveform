import React, { useRef, useEffect, useState, useCallback } from "react";
import "./App.css";
import WaveSurfer from "wavesurfer.js";

type PlayState = "stopped" | "playing" | "paused";
type OnReadyParams = {
  duration: number;
};

function App() {
  const [playState, setPlayState] = useState<PlayState>("stopped");
  const [currentlyPlaying, setCurrentlyPlaying] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const totalDurationRef = useRef(0);
  const filenames = ["boom", "satc", "carmina"];

  function handleOnReady({ duration }: OnReadyParams) {
    console.log(duration);
    totalDurationRef.current = totalDurationRef.current + duration;
    setTotalDuration(totalDurationRef.current);
  }
  function handleFinish(currentIndex: number) {
    const totalAudioCount = filenames.length;
    const isLastAudio = currentIndex + 1 === totalAudioCount;
    if (isLastAudio) {
      setPlayState("stopped");
      setCurrentlyPlaying(0);
    } else {
      setCurrentlyPlaying(currentIndex + 1);
    }
  }

  return (
    <div className="App">
      <button
        onClick={() => {
          if (["stopped", "paused"].includes(playState))
            setPlayState("playing");
          if (playState === "playing") setPlayState("paused");
        }}
      >
        {["stopped", "paused"].includes(playState) ? "play" : "pause"}
      </button>
      <button
        disabled={["stopped"].includes(playState)}
        onClick={() => {
          setPlayState("stopped");
        }}
      >
        stop
      </button>
      <div
        style={{
          display: "flex"
        }}
      >
        {filenames.map((filename, index) => {
          const audioPlayState =
            index === currentlyPlaying ? playState : "stopped";
          return (
            <Waveform
              key={`waveform-${filename}-${index}`}
              filename={filename}
              playState={audioPlayState}
              onFinish={() => handleFinish(index)}
              onReady={handleOnReady}
              totalDuration={totalDuration}
            />
          );
        })}
      </div>
    </div>
  );
}

type WaveformProps = {
  filename: string;
  playState: PlayState;
  onFinish: () => void;
  onReady: (params: OnReadyParams) => void;
  totalDuration: number;
};

function Waveform({
  filename,
  playState,
  onFinish,
  onReady,
  totalDuration
}: WaveformProps) {
  // console.log(filename, totalDuration);
  // const [isPlaying, setIsPlaying] = useState(false);
  const [waveWidth, setWaveWidth] = useState(0);
  const [isWaveformReady, setIsWaveformReady] = useState(false);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const canvasRef = useCallback(node => {
    if (node !== null) {
    }
  }, []);
  const id = `canvas-${filename}`;
  useEffect(() => {
    if (!isWaveformReady) {
      const wavesurferInstance = WaveSurfer.create({
        container: `#${id}`,
        waveColor: "violet",
        progressColor: "purple",
        responsive: true
      });
      wavesurferInstance.load(`/audio/${filename}.mp3`);
      wavesurferInstance.on("ready", function() {
        console.log(filename, "onready", isWaveformReady);
        onReady({ duration: wavesurferInstance.getDuration() });
        setIsWaveformReady(true);
      });
      wavesurferInstance.on("finish", function() {
        // wavesurferInstance.stop();
        // setIsPlaying(false);

        onFinish();
      });
      wavesurferRef.current = wavesurferInstance;
    }
  }, [filename, onFinish, onReady, id, isWaveformReady]);

  useEffect(() => {
    const waveform = wavesurferRef.current;
    if (waveform !== null) {
      switch (playState) {
        case "stopped":
          waveform.stop();
          break;
        case "playing":
          waveform.play();
          break;
        case "paused":
          waveform.pause();
          break;
      }
    }
  }, [playState, isWaveformReady]);
  return (
    <div id={id} ref={canvasRef} style={{ flex: `0 0 ${waveWidth}%` }}></div>
  );
}

export default App;
