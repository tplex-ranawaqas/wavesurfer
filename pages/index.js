import { useEffect, useState, useRef } from "react";
import Head from "next/head";
import WaveSurfer from "wavesurfer.js";
import RecordPlugin from "wavesurfer.js/dist/plugins/record.esm.js";

export default function Home() {
  const micRef = useRef(null);
  const recordingsRef = useRef(null);
  const pauseBtnRef = useRef(null);
  const recBtnRef = useRef(null);
  const progressRef = useRef(null);

  const [waveSurferInstance, setWaveSurferInstance] = useState(null);
  const [record, setRecord] = useState(null);
  const [activeDeviceId, setActiveDeviceId] = useState(null);

  // Initialize Wavesurfer + Record Plugin
  const createWaveSurfer = () => {
    waveSurferInstance?.destroy();

    const ws = WaveSurfer.create({
      container: micRef.current,
      waveColor: "rgb(200, 0, 200)",
      progressColor: "rgb(100, 0, 100)",
    });

    const rec = ws.registerPlugin(
      RecordPlugin.create({
        renderRecordedAudio: false,
      })
    );

    rec.on("record-end", async (blob) => {
  // Upload to server
  const formData = new FormData();
  formData.append("file", blob, "recording.webm");

  const res = await fetch("/api/upload", {
    method: "POST",
    body: blob,
    headers: {
      "Content-Type": "application/octet-stream",
    },
  });

  if (res.ok) {
    console.log("Saved to /downloads/recording.webm");
  } else {
    console.error("Upload failed");
  }

  // Playback preview
  recordingsRef.current.innerHTML = "";
  const recordedUrl = URL.createObjectURL(blob);

  const wsPlayback = WaveSurfer.create({
    container: recordingsRef.current,
    waveColor: "rgb(200, 100, 0)",
    progressColor: "rgb(100, 50, 0)",
    url: recordedUrl,
  });

  const playBtn = document.createElement("button");
  playBtn.textContent = "Play";
  playBtn.onclick = () => wsPlayback.playPause();
  recordingsRef.current.appendChild(playBtn);
});




    rec.on("record-progress", (time) => {
      const formatted = [
        Math.floor((time % 3600000) / 60000),
        Math.floor((time % 60000) / 1000),
      ]
        .map((v) => (v < 10 ? "0" + v : v))
        .join(":");
      progressRef.current.textContent = formatted;
    });

    setWaveSurferInstance(ws);
    setRecord(rec);

    if (pauseBtnRef.current) pauseBtnRef.current.style.display = "none";
    if (recBtnRef.current) recBtnRef.current.textContent = "Record";
  };

  // useEffect(() => {
  //   navigator.mediaDevices
  //     .getUserMedia({ audio: true })
  //     .then(() => {
  //       navigator.mediaDevices.enumerateDevices().then((devices) => {
  //         const audioDevices = devices.filter(
  //           (device) => device.kind === "audioinput"
  //         );

  //         if (audioDevices.length > 0) {
  //           setActiveDeviceId(audioDevices[0].deviceId);
  //         }
  //       });

  //       createWaveSurfer();
  //     })
  //     .catch((err) => {
  //       console.error("Error accessing microphone: ", err);
  //       alert("Microphone permission denied. Please allow access.");
  //     });
  // }, []);

  const handleRecord = async () => {
    if (!record) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioDevices = devices.filter((device) => device.kind === "audioinput");
        if (audioDevices.length > 0) {
          setActiveDeviceId(audioDevices[0].deviceId);
        }
  
        createWaveSurfer(); // move inside after permission
      } catch (err) {
        console.error("Error accessing microphone: ", err);
        alert("Microphone permission denied or not supported.");
        return;
      }
    }
  
    if (!record || !activeDeviceId) return;
  
    if (record.isRecording() || record.isPaused()) {
      record.stopRecording();
      recBtnRef.current.textContent = "Record";
      pauseBtnRef.current.style.display = "none";
      return;
    }
  
    recBtnRef.current.disabled = true;
    await record.startRecording({ deviceId: activeDeviceId });
    recBtnRef.current.disabled = false;
    recBtnRef.current.textContent = "Stop";
    pauseBtnRef.current.style.display = "inline";
  };
  
  // const handleRecord = async () => {
  //   if (!record || !activeDeviceId) return;

  //   if (record.isRecording() || record.isPaused()) {
  //     record.stopRecording();
  //     recBtnRef.current.textContent = "Record";
  //     pauseBtnRef.current.style.display = "none";
  //     return;
  //   }

  //   recBtnRef.current.disabled = true;

  //   await record.startRecording({ deviceId: activeDeviceId });
  //   recBtnRef.current.disabled = false;
  //   recBtnRef.current.textContent = "Stop";
  //   pauseBtnRef.current.style.display = "inline";
  // };

  const handlePause = () => {
    if (!record) return;

    if (record.isPaused()) {
      record.resumeRecording();
      pauseBtnRef.current.textContent = "Pause";
    } else {
      record.pauseRecording();
      pauseBtnRef.current.textContent = "Resume";
    }
  };

  return (
    <>
      <Head>
        <title>WaveSurfer Recorder</title>
      </Head>
      <main style={{ padding: "2rem" }}>
        <div ref={micRef} style={{ height: "128px", margin: "20px 0" }}></div>

        <div style={{ marginBottom: "10px" }}>
          <button onClick={handleRecord} ref={recBtnRef}>
            Record
          </button>
          <button
            onClick={handlePause}
            ref={pauseBtnRef}
            style={{ display: "none", marginLeft: "1rem" }}
          >
            Pause
          </button>
          <span ref={progressRef} style={{ marginLeft: "2rem" }}>
            00:00
          </span>
        </div>

        <div ref={recordingsRef} style={{ marginTop: "2rem" }}></div>
      </main>
    </>
  );
}
