import React, { useRef, useEffect, useState, useCallback } from "react";
import "./App.css";
import WaveSurfer from "wavesurfer.js";
import styled from "styled-components";
import {
  DragDropContext,
  Droppable,
  DropResult,
  Draggable
} from "react-beautiful-dnd";
type PlayState = "stopped" | "playing" | "paused";

type File = {
  id: number;
  name: string;
  duration: number | null;
  peaks: number[] | null;
};
type OnReadyParams = Omit<File, "name">;

const fileObj = {
  1: {
    id: 1,
    name: "boom",
    duration: null,
    peaks: null
  },
  2: {
    id: 2,
    name: "satc",
    duration: null,
    peaks: null
  },
  3: {
    id: 3,
    name: "carmina",
    duration: null,
    peaks: null
  }
};
const FILES = [
  {
    id: 1,
    name: "boom",
    duration: 0
  },
  {
    id: 2,
    name: "satc",
    duration: 0
  },
  {
    id: 3,
    name: "carmina",
    duration: 0
  }
];
const INITIAL_ORDER = [1, 2, 3];
// const filenames = ["boom"];
// const filenames = ["boom", "carmina"];
const filenames = ["satc", "carmina"];
// const filenames = ["satc", "boom", "carmina"];

const Container = styled.div`
  width: 100%;
  max-width: 1280px;
  margin: auto;
`;

function App() {
  const [playState, setPlayState] = useState<PlayState>("stopped");
  const [activeAudio, setActiveAudio] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [audios, setAudios] = useState<number[]>(INITIAL_ORDER);
  const audioRefs = useRef<{ [key: number]: File }>(fileObj);
  const totalDurationRef = useRef(0);
  function handleOnReady({ duration, peaks, id }: OnReadyParams) {
    const audio = audioRefs.current[id];
    if (audio.peaks === null) {
      audioRefs.current[id].peaks = peaks;
    }
    if (audio.duration === null && duration !== null) {
      audioRefs.current[id].duration = duration;
      totalDurationRef.current += duration;
      setTotalDuration(totalDurationRef.current);
    }
  }
  function handleFinish(audioId: number) {
    const position = audios.indexOf(audioId);
    const totalAudioCount = audios.length;
    const isLastAudio = position === totalAudioCount - 1;
    if (isLastAudio) {
      setPlayState("stopped");
      setActiveAudio(0);
    } else {
      setActiveAudio(position + 1);
    }
  }

  function onDragEnd(result: DropResult) {
    const { destination, source } = result;
    if (destination === null || destination === undefined) return;
    if (destination.index === source.index) return;
    const newAudios = Array.from(audios);
    newAudios.splice(source.index, 1);
    newAudios.splice(destination.index, 0, audios[source.index]);

    setAudios(newAudios);
  }
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Container>
        <h1>check it</h1>
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
            setActiveAudio(0);
          }}
        >
          stop
        </button>
        <Droppable droppableId="somthin" direction="horizontal">
          {provided => (
            <Timeline {...provided.droppableProps} ref={provided.innerRef}>
              {audios.map((audio, index) => {
                const {
                  name,
                  duration,
                  id: audioId,
                  peaks
                } = audioRefs.current[audio];
                const width =
                  totalDuration > 0 && duration !== null
                    ? (duration / totalDurationRef.current) * 100
                    : 0;
                const audioPlayState =
                  index === activeAudio ? playState : "stopped";
                return (
                  <Waveform
                    index={index}
                    key={`waveform-${name}-${index}`}
                    name={name}
                    width={width}
                    playState={audioPlayState}
                    onFinish={() => handleFinish(audioId)}
                    onReady={handleOnReady}
                    totalDuration={totalDuration}
                    onClick={() => {
                      setActiveAudio(index);
                    }}
                    audioId={audioId}
                    peaks={peaks}
                  />
                );
              })}
              {provided.placeholder}
            </Timeline>
          )}
        </Droppable>
      </Container>
    </DragDropContext>
  );
}

type WaveformStatus = "idle" | "loading" | "ready";

export {};
declare global {
  interface Window {
    waveform: WaveSurfer;
  }
}

type WaveformProps = {
  name: string;
  playState: PlayState;
  onFinish: () => void;
  onClick: () => void;
  onReady: (params: OnReadyParams) => void;
  totalDuration: number;
  index: number;
  width: number;
  audioId: number;
  peaks: number[] | null;
};
function Waveform({
  name,
  playState,
  onFinish,
  onReady,
  totalDuration,
  onClick,
  index,
  width,
  audioId,
  peaks
}: WaveformProps) {
  // const [isPlaying, setIsPlaying] = useState(false);
  const [waveWidth, setWaveWidth] = useState(0);
  const [waveformStatus, setWaveformStatus] = useState<WaveformStatus>("idle");
  const [duration, setDuration] = useState(0);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const wavesurferStatusRef = useRef("idle");
  const canvasRef = useCallback(node => {
    if (node !== null) {
    }
  }, []);
  const id = `canvas-${name}`;

  useEffect(() => {
    if (totalDuration > 0 && duration > 0) {
      setWaveWidth((duration / totalDuration) * 100);
    }
  }, [totalDuration, duration]);

  useEffect(() => {
    const waveform = wavesurferRef.current;
    if (waveform !== null) {
      waveform.drawBuffer();
    }
  }, [waveWidth]);
  useEffect(() => {
    if (waveformStatus === "idle") {
      setWaveformStatus("loading");
      const wavesurferInstance = WaveSurfer.create({
        container: `#${id}`,
        waveColor: "violet",
        progressColor: "purple",
        responsive: true
      });
      wavesurferInstance.load(
        `/audio/${name}.mp3`,
        peaks !== null ? peaks : undefined
      );
      wavesurferInstance.on("ready", async function() {
        const duration = wavesurferInstance.getDuration();
        setDuration(duration);
        wavesurferStatusRef.current = "ready";
        setWaveformStatus("ready");
        const peaks = await wavesurferInstance.exportPCM(1024, 10000, true);
        onReady({ duration, peaks: JSON.parse(peaks), id: audioId });
      });
      wavesurferInstance.on("finish", function() {
        onFinish();
      });

      // wavesurferInstance.on("audioprocess", () => {
      //   console.log("audioprocess");
      // });
      // wavesurferInstance.on("dblclick", () => {
      //   console.log("dblclick");
      // });
      // wavesurferInstance.on("destroy", () => {
      //   console.log("destroy");
      // });
      // wavesurferInstance.on("error", () => {
      //   console.log("error");
      // });
      // wavesurferInstance.on("finish", () => {
      //   console.log("finish");
      // });
      // wavesurferInstance.on("interaction", () => {
      //   console.log("interaction");
      // });
      // wavesurferInstance.on("loading", () => {
      //   console.log("loading");
      // });
      // wavesurferInstance.on("mute", () => {
      //   console.log("mute");
      // });
      // wavesurferInstance.on("pause", () => {
      //   console.log("pause");
      // });
      // wavesurferInstance.on("play", () => {
      //   console.log("play");
      // });
      // wavesurferInstance.on("ready", () => {
      //   console.log("ready");
      // });
      // wavesurferInstance.on("scroll", () => {
      //   console.log("scroll");
      // });
      // wavesurferInstance.on("volume", () => {
      //   console.log("volume");
      // });
      // wavesurferInstance.on("waveform-ready", () => {
      //   console.log("waveform-ready");
      // });
      // wavesurferInstance.on("zoom", () => {
      //   console.log("zoom");
      // });

      wavesurferRef.current = wavesurferInstance;
      window.waveform = wavesurferInstance;
    }
  }, [name, onFinish, onReady, id, waveformStatus, audioId, peaks]);

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
  }, [playState]);
  return (
    <Draggable draggableId={name} key={name} index={index}>
      {provided => (
        <WaveformWrapper
          {...provided.draggableProps}
          id={id}
          waveWidth={width}
          onClick={onClick}
        >
          <Dragger {...provided.dragHandleProps} ref={provided.innerRef}>
            X
          </Dragger>
        </WaveformWrapper>
      )}
    </Draggable>
  );
}

const WaveformWrapper = styled.div<{ waveWidth?: number }>`
  /* background-color: red; */
  /* position: relative; */
  flex: ${props => `0 0 ${props.waveWidth}%`};
  /* flex: 1 */
`;

const Dragger = styled.div`
  background-color: #999;
  width: 100%;
`;

const Timeline = styled.div`
  display: flex;
  border: 1px solid #000;
`;

export default App;
