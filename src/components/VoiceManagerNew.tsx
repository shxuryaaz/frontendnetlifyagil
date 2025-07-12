import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Play, CircleStop, Mic, Loader2 } from "lucide-react";
import { AudioRecorder, sendAudioToBackend } from "../utils/audioRecorder";

type RecordingMode = "batch" | "continuous";
type RecordingStatus = "idle" | "recording" | "processing";

interface LogEntry {
  id: string;
  timestamp: string;
  type: "info" | "success" | "warning" | "error" | "voice" | "transcribed" | "task" | "due-date";
  message: string;
  details?: {
    transcription?: string;
    taskName?: string;
    taskStatus?: string;
    dueDate?: string;
  };
}

interface VoiceManagerProps {
  platform?: string;
  selectedBoard?: string;
  boards?: any[];
}

const VoiceManagerNew = ({ platform, selectedBoard, boards }: VoiceManagerProps) => {
  const [recordingMode, setRecordingMode] = useState<RecordingMode>("batch");
  const [recordingStatus, setRecordingStatus] = useState<RecordingStatus>("idle");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [recordingTime, setRecordingTime] = useState(0);

  const recordingInterval = useRef<NodeJS.Timeout | null>(null);
  const audioRecorder = useRef<AudioRecorder>(new AudioRecorder());

  const addLog = (
    type: LogEntry["type"],
    message: string,
    options?: { details?: LogEntry["details"] }
  ) => {
    const newLog: LogEntry = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      type,
      message,
      ...(options?.details ? { details: options.details } : {}),
    };
    setLogs((prev) => {
      const updatedLogs = [newLog, ...prev].slice(0, 50);
      return updatedLogs.sort((a, b) => {
        const timeA = new Date(`1970-01-01 ${a.timestamp}`).getTime();
        const timeB = new Date(`1970-01-01 ${b.timestamp}`).getTime();
        return timeB - timeA;
      });
    });
  };

  const startRecording = async () => {
    try {
      await audioRecorder.current.startRecording();
      setRecordingStatus("recording");
      setRecordingTime(0);
      addLog("info", `Listening...`);

      recordingInterval.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      addLog("error", "Failed to start recording: " + (error as Error).message);
    }
  };

  const stopRecording = async () => {
    try {
      const audioBlob = await audioRecorder.current.stopRecording();
      setRecordingStatus("idle");
      addLog("success", `Processing...`);

      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
        recordingInterval.current = null;
      }
      setRecordingTime(0);

      addLog("voice", "Voice received", {});

      // Send audio to backend with platform context
      try {
        const platformConfig = platform === 'trello' ? {
          platform: 'trello',
          apiKey: import.meta.env.VITE_TRELLO_APP_KEY,
          boardId: selectedBoard,
          token: localStorage.getItem('trello_token')
        } : null;

        const res = await sendAudioToBackend(audioBlob, platform, platformConfig);
        let data;
        try {
          data = await res.json();
        } catch (e) {
          addLog("error", "Failed to parse backend response as JSON");
          return;
        }
        
        if (data.transcript) {
          addLog("transcribed", `Transcribed: ${data.transcript}`);
        }
        
        if (Array.isArray(data.results)) {
          data.results.forEach((result) => {
            if (result.success) {
              addLog(
                "task",
                `Task ${result.operation === "create" ? "created" : result.operation}` + (result.task ? `: ${result.task}` : ""),
                { details: { taskName: result.task, taskStatus: result.operation } }
              );
            } else {
              addLog(
                "error",
                `Task operation failed${result.task ? ` for: ${result.task}` : ""}${result.error ? ` - ${result.error}` : ""}`
              );
            }
          });
        }
      } catch (error) {
        addLog("error", "Failed to send audio: " + (error as Error).message);
      }
    } catch (error) {
      addLog("error", "Failed to stop recording: " + (error as Error).message);
      setRecordingStatus("idle");
    }
  };

  const getStatusColor = () => {
    switch (recordingStatus) {
      case "recording":
        return "bg-red-500";
      case "processing":
        return "bg-yellow-500";
      default:
        return "bg-gray-400";
    }
  };

  const getStatusText = () => {
    switch (recordingStatus) {
      case "recording":
        return "Recording...";
      case "processing":
        return "Processing...";
      default:
        return "Ready";
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getLogIcon = (type: LogEntry["type"]) => {
    switch (type) {
      case "voice":
        return "🎤";
      case "transcribed":
        return "💬";
      case "task":
        return "✅";
      case "error":
        return "❌";
      case "success":
        return "✅";
      case "warning":
        return "⚠️";
      default:
        return "ℹ️";
    }
  };

  const getLogColor = (type: LogEntry["type"]) => {
    switch (type) {
      case "error":
        return "text-red-600";
      case "success":
        return "text-green-600";
      case "warning":
        return "text-yellow-600";
      case "voice":
        return "text-blue-600";
      case "transcribed":
        return "text-purple-600";
      case "task":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="space-y-6">
      {/* Platform Info */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900">
            Voice Commands
          </CardTitle>
          <p className="text-gray-600">
            Connected to {platform?.charAt(0).toUpperCase() + platform?.slice(1)}
            {platform === 'trello' && selectedBoard && (
              <span className="ml-2 text-sm text-blue-600">
                • Board: {boards?.find(b => b.id === selectedBoard)?.name || selectedBoard}
              </span>
            )}
          </p>
        </CardHeader>
      </Card>

      {/* Recording Controls */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className={`w-4 h-4 rounded-full ${getStatusColor()} animate-pulse`}></div>
              <span className="text-sm font-medium text-gray-700">{getStatusText()}</span>
              {recordingStatus === "recording" && (
                <span className="text-sm text-gray-500">{formatTime(recordingTime)}</span>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRecordingMode(recordingMode === "batch" ? "continuous" : "batch")}
                className="text-xs"
              >
                {recordingMode === "batch" ? "Batch Mode" : "Continuous Mode"}
              </Button>
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={recordingStatus === "idle" ? startRecording : stopRecording}
              disabled={recordingStatus === "processing"}
              className={`w-20 h-20 rounded-full ${
                recordingStatus === "recording"
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-blue-600 hover:bg-blue-700"
              } text-white shadow-lg hover:shadow-xl transition-all duration-300`}
            >
              {recordingStatus === "processing" ? (
                <Loader2 className="w-8 h-8 animate-spin" />
              ) : recordingStatus === "recording" ? (
                <CircleStop className="w-8 h-8" />
              ) : (
                <Mic className="w-8 h-8" />
              )}
            </Button>
          </div>

          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              {recordingStatus === "idle"
                ? "Click to start recording"
                : recordingStatus === "recording"
                ? "Click to stop recording"
                : "Processing your voice command..."}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Logs */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Activity Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {logs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Mic className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No activity yet. Start recording to see logs here.</p>
                </div>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
                    <span className="text-lg">{getLogIcon(log.type)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-medium ${getLogColor(log.type)}`}>
                          {log.message}
                        </span>
                        <span className="text-xs text-gray-400">{log.timestamp}</span>
                      </div>
                      {log.details && (
                        <div className="mt-1 text-xs text-gray-500">
                          {log.details.transcription && (
                            <p>Transcription: {log.details.transcription}</p>
                          )}
                          {log.details.taskName && (
                            <p>Task: {log.details.taskName}</p>
                          )}
                          {log.details.taskStatus && (
                            <p>Status: {log.details.taskStatus}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceManagerNew; 