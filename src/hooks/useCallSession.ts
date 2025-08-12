import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CallLog, CallRecording } from "@/lib/calls";

export function useCallSession() {
  const [active, setActive] = useState(false);
  const [notes, setNotes] = useState("");
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);

  // Recording
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    let t: number | undefined;
    if (active) {
      t = window.setInterval(() => setSeconds((s) => s + 1), 1000) as unknown as number;
    }
    return () => {
      if (t) window.clearInterval(t);
    };
  }, [active]);

  const start = useCallback(() => {
    setActive(true);
    setNotes("");
    setSeconds(0);
    setStartedAt(new Date().toISOString());
  }, []);

  const stop = useCallback(async () => {
    setActive(false);
    const endedAt = new Date().toISOString();
    let recording: CallRecording | undefined;

    if (isRecording && mediaRecorderRef.current) {
      const rec = mediaRecorderRef.current;
      if (rec.state !== "inactive") rec.stop();
      // Wait a tick to ensure dataavailable fired
      await new Promise((r) => setTimeout(r, 50));
    }

    if (chunksRef.current.length > 0) {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      const arrayBuffer = await blob.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      recording = { mime: "audio/webm", dataBase64: base64 };
      chunksRef.current = [];
    }

    setIsRecording(false);

    return { startedAt, endedAt, durationSec: seconds, notes, recording } as Pick<CallLog, "startedAt" | "endedAt" | "durationSec" | "notes" | "recording">;
  }, [isRecording, notes, seconds, startedAt]);

  const toggleRecording = useCallback(async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];
      rec.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
      };
      rec.start();
      mediaRecorderRef.current = rec;
      setIsRecording(true);
    } catch (e) {
      console.warn("Audio recording not permitted", e);
      setIsRecording(false);
    }
  }, [isRecording]);

  return {
    // state
    active,
    startedAt,
    seconds,
    notes,
    isRecording,
    // actions
    setNotes,
    start,
    stop,
    toggleRecording,
    // helpers
    timeLabel: useMemo(() => {
      const m = Math.floor(seconds / 60).toString().padStart(2, "0");
      const s = (seconds % 60).toString().padStart(2, "0");
      return `${m}:${s}`;
    }, [seconds]),
  };
}
