
import React, { useRef, useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Mic, Square } from "lucide-react";

interface AudioRecorderProps {
  isRecording: boolean;
  onRecordingComplete: (blob: Blob) => void;
  recordingTime: number;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ 
  isRecording, 
  onRecordingComplete,
  recordingTime 
}) => {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRecording) {
      startRecording();
    } else if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      stopRecording();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Set up audio visualization
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);
      
      // Start audio level visualization
      visualizeAudio();
      
      // Create and start media recorder
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        onRecordingComplete(audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        
        // Reset visualization
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        setAudioLevel(0);
      };
      
      mediaRecorderRef.current.start();
    } catch (error) {
      console.error("Error starting audio recording:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
  };

  const visualizeAudio = () => {
    if (!analyserRef.current) return;
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    
    const updateAudioLevel = () => {
      if (!analyserRef.current) return;
      
      analyserRef.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
      const normalized = Math.min(100, Math.max(0, (average / 128) * 100));
      setAudioLevel(normalized);
      
      animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
    };
    
    updateAudioLevel();
  };

  return (
    <div className="flex flex-col items-center">
      <div className="w-full bg-black/10 rounded-lg p-8 flex flex-col items-center">
        <div className={`w-24 h-24 rounded-full flex items-center justify-center ${isRecording ? 'bg-red-500/20' : 'bg-muted'}`}>
          <Mic className={`h-10 w-10 ${isRecording ? 'text-red-500 animate-pulse' : 'text-muted-foreground'}`} />
        </div>
        
        {isRecording && (
          <div className="mt-6 w-full">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-medium">Audio Level</p>
              <span className="text-xs text-muted-foreground">{recordingTime}s / 10s</span>
            </div>
            <Progress value={audioLevel} className="h-2" />
          </div>
        )}
        
        {!isRecording && (
          <p className="text-sm text-muted-foreground mt-4">
            Audio will be recorded when you press the Start Recording button
          </p>
        )}
      </div>
    </div>
  );
};

export default AudioRecorder;
