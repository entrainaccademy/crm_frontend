"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, AlertCircle, Loader2, Volume2 } from "lucide-react";
import { api } from "@/lib/api";

// Keep track of the currently active playing audio element across the page
let currentlyPlayingAudio = null;

export function AudioPlayer({ callId, duration = "00:00", recordingStatus = "Available" }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const audioRef = useRef(null);

  const audioUrl = api.getCallAudioStreamUrl(callId);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        if (currentlyPlayingAudio === audioRef.current) {
          currentlyPlayingAudio = null;
        }
      }
    };
  }, []);

  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const togglePlay = async (e) => {
    e.stopPropagation();
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      // Pause any other currently playing audio on page
      if (currentlyPlayingAudio && currentlyPlayingAudio !== audioRef.current) {
        currentlyPlayingAudio.pause();
      }

      setIsLoading(true);
      setHasError(false);
      currentlyPlayingAudio = audioRef.current;

      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (err) {
        console.warn("Audio play error:", err.message);
        setHasError(true);
        setErrorMessage("Could not play audio. Please check network or permissions.");
        setIsPlaying(false);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setTotalDuration(audioRef.current.duration || 0);
      setIsLoading(false);
    }
  };

  const handleSeek = (e) => {
    e.stopPropagation();
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (currentlyPlayingAudio === audioRef.current) {
      currentlyPlayingAudio = null;
    }
  };

  const handleError = () => {
    setIsLoading(false);
    setIsPlaying(false);
    setHasError(true);
    setErrorMessage("Audio stream unavailable");
  };

  if (recordingStatus === "Processing") {
    return (
      <span
        className="recording-status-badge processing"
        title="Recording is currently processing from provider"
      >
        <Loader2 size={12} className="spin-icon" />
        <span>Processing</span>
      </span>
    );
  }

  if (recordingStatus === "Failed") {
    return (
      <span
        className="recording-status-badge failed"
        title="Call recording failed or was absent"
      >
        <AlertCircle size={12} />
        <span>Failed</span>
      </span>
    );
  }

  if (recordingStatus === "Not recorded" || !recordingStatus) {
    return <span className="muted" style={{ fontSize: "11px" }}>Not recorded</span>;
  }

  if (hasError) {
    return (
      <button
        className="audio-player-error"
        onClick={togglePlay}
        title={errorMessage || "Click to retry playing"}
      >
        <AlertCircle size={12} />
        <span>Retry</span>
      </button>
    );
  }

  const effectiveDuration = totalDuration || (typeof duration === "string" && duration.includes(":") ? duration : 0);

  return (
    <div
      className={`compact-audio-player ${isPlaying ? "is-playing" : ""}`}
      onClick={(e) => e.stopPropagation()}
    >
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="none"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onError={handleError}
      />
      <button
        type="button"
        className="audio-ctrl-btn"
        onClick={togglePlay}
        disabled={isLoading}
        title={isPlaying ? "Pause recording" : "Listen to recording"}
        aria-label={isPlaying ? "Pause call recording" : "Play call recording"}
      >
        {isLoading ? (
          <Loader2 size={13} className="spin-icon" />
        ) : isPlaying ? (
          <Pause size={13} />
        ) : (
          <Play size={13} style={{ marginLeft: "1px" }} />
        )}
      </button>

      <div className="audio-track-info">
        <input
          type="range"
          min="0"
          max={totalDuration || 100}
          step="0.1"
          value={currentTime}
          onChange={handleSeek}
          className="audio-seek-slider"
          aria-label="Seek audio"
        />
        <div className="audio-time-label">
          <span>{formatTime(currentTime)}</span>
          <span>/</span>
          <span>
            {totalDuration > 0
              ? formatTime(totalDuration)
              : typeof duration === "string"
              ? duration
              : "00:00"}
          </span>
        </div>
      </div>
    </div>
  );
}
