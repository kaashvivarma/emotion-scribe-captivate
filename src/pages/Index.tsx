
import React, { useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { Mic, Camera, Upload, Loader2 } from "lucide-react";
import VideoCapture from "@/components/VideoCapture";
import AudioRecorder from "@/components/AudioRecorder";
import EmotionResults from "@/components/EmotionResults";
import ModelUploader from "@/components/ModelUploader";

type EmotionData = {
  facial: string | null;
  speech: string | null;
  confidence: {
    facial: number | null;
    speech: number | null;
  };
};

const Index = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [facialKeypoints, setFacialKeypoints] = useState<number[][] | null>(null);
  const [emotionData, setEmotionData] = useState<EmotionData>({
    facial: null,
    speech: null,
    confidence: {
      facial: null,
      speech: null,
    },
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState("capture");

  const handleImageCapture = (imageData: string) => {
    setCapturedImage(imageData);
    // In a real implementation, this would trigger facial analysis
  };

  const handleAudioRecorded = (blob: Blob) => {
    setAudioBlob(blob);
    setIsRecording(false);
    // In a real implementation, this would trigger audio analysis
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    setEmotionData({
      facial: null,
      speech: null,
      confidence: {
        facial: null,
        speech: null,
      },
    });
    setFacialKeypoints(null);
  };

  const handleAnalyzeData = async () => {
    if (!capturedImage || !audioBlob || !isModelLoaded) {
      toast({
        title: "Missing data",
        description: "Please capture an image and record audio before analyzing.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      // Simulate model processing time
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simulate facial keypoints (would be real data from model)
      const mockKeypoints = Array.from({ length: 68 }, () => [
        Math.random() * 96,
        Math.random() * 96,
      ]);
      setFacialKeypoints(mockKeypoints);

      // Simulate emotion results (would be real data from model)
      const emotions = ["happy", "sad", "angry", "surprised", "neutral", "fearful"];
      const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
      const randomEmotion2 = emotions[Math.floor(Math.random() * emotions.length)];
      
      setEmotionData({
        facial: randomEmotion,
        speech: randomEmotion2,
        confidence: {
          facial: Math.random() * 0.5 + 0.5, // Random confidence between 0.5 and 1
          speech: Math.random() * 0.5 + 0.5,
        },
      });

      toast({
        title: "Analysis complete",
        description: "Emotion analysis has been completed successfully.",
      });
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis failed",
        description: "There was an error analyzing the data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleModelUpload = (status: boolean) => {
    setIsModelLoaded(status);
    if (status) {
      toast({
        title: "Models loaded",
        description: "All AI models have been successfully loaded.",
      });
    }
  };

  useEffect(() => {
    if (isRecording) {
      const intervalId = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 10) {
            clearInterval(intervalId);
            setIsRecording(false);
            return 10;
          }
          return prev + 1;
        });
      }, 1000);

      return () => clearInterval(intervalId);
    }
  }, [isRecording]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-slate-900">
      <div className="container max-w-5xl py-8">
        <h1 className="text-3xl font-bold mb-2 text-center">Emotion Analysis AI</h1>
        <p className="text-muted-foreground text-center mb-8">
          Detect emotions from facial expressions and speech using advanced AI models
        </p>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="capture">Capture & Analyze</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
            <TabsTrigger value="models">Model Management</TabsTrigger>
          </TabsList>

          <TabsContent value="capture" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-4">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Camera className="mr-2 h-5 w-5" /> Video Capture
                </h2>
                <VideoCapture 
                  onCapture={handleImageCapture} 
                  isRecording={isRecording}
                  capturedImage={capturedImage}
                  facialKeypoints={facialKeypoints}
                />
              </Card>

              <Card className="p-4">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Mic className="mr-2 h-5 w-5" /> Audio Recording
                </h2>
                <AudioRecorder 
                  isRecording={isRecording}
                  onRecordingComplete={handleAudioRecorded}
                  recordingTime={recordingTime}
                />

                {audioBlob && !isRecording && (
                  <div className="mt-4">
                    <audio controls className="w-full">
                      <source src={URL.createObjectURL(audioBlob)} type="audio/webm" />
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                )}
              </Card>
            </div>

            <div className="flex flex-col items-center gap-4">
              {isRecording ? (
                <div className="flex items-center">
                  <Badge variant="outline" className="animate-pulse-recording px-3 py-1">
                    Recording {recordingTime}s / 10s
                  </Badge>
                  <Progress value={recordingTime * 10} className="w-64 ml-4" />
                </div>
              ) : (
                <>
                  <Button 
                    onClick={handleStartRecording} 
                    className="gap-2"
                    disabled={!isModelLoaded}
                  >
                    <Mic className="h-4 w-4" /> Start Recording (10s)
                  </Button>
                  
                  <Button 
                    onClick={handleAnalyzeData} 
                    variant="secondary" 
                    className="gap-2"
                    disabled={!capturedImage || !audioBlob || isAnalyzing || !isModelLoaded}
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Analyzing...
                      </>
                    ) : (
                      <>
                        Analyze Emotions
                      </>
                    )}
                  </Button>
                  
                  {!isModelLoaded && (
                    <p className="text-sm text-muted-foreground">
                      Please upload or select AI models first
                    </p>
                  )}
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="results">
            <EmotionResults 
              emotionData={emotionData}
              facialKeypoints={facialKeypoints}
              capturedImage={capturedImage}
            />
          </TabsContent>
          
          <TabsContent value="models">
            <ModelUploader onModelsLoaded={handleModelUpload} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
