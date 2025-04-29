import React, { useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { Mic, Camera, Loader2 } from "lucide-react";
import ImageCapture from "@/components/ImageCapture";
import AudioRecorder from "@/components/AudioRecorder";
import EmotionResults from "@/components/EmotionResults";
import { predictFacialKeypoints, predictFacialEmotion, predictSpeechEmotion } from "@/utils/modelLoader";

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
  const [activeTab, setActiveTab] = useState("capture");

  const handleImageCapture = (imageData: string) => {
    setCapturedImage(imageData);
    setFacialKeypoints(null); // Reset keypoints when capturing a new image
    // Don't analyze immediately, wait for the user to press the analyze button
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
    if (!capturedImage || !audioBlob) {
      toast({
        title: "Missing data",
        description: "Please capture an image and record audio before analyzing.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      // Get facial keypoints from the model
      const keypoints = await predictFacialKeypoints(capturedImage);
      setFacialKeypoints(keypoints);
      console.log("Facial keypoints detected:", keypoints);

      // Get facial emotion from the model
      const facialEmotionResult = await predictFacialEmotion(capturedImage);
      console.log("Facial emotion detected:", facialEmotionResult);

      // Get speech emotion from the model
      const speechEmotionResult = await predictSpeechEmotion(audioBlob);
      console.log("Speech emotion detected:", speechEmotionResult);

      // Update the emotion data
      setEmotionData({
        facial: facialEmotionResult.emotion,
        speech: speechEmotionResult.emotion,
        confidence: {
          facial: facialEmotionResult.confidence,
          speech: speechEmotionResult.confidence,
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
          <TabsList className="grid grid-cols-2 mb-8">
            <TabsTrigger value="capture">Capture & Analyze</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>

          <TabsContent value="capture" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-4">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Camera className="mr-2 h-5 w-5" /> Image Capture (96x96)
                </h2>
                <ImageCapture 
                  onCapture={handleImageCapture} 
                  capturedImage={capturedImage}
                  facialKeypoints={facialKeypoints}
                />
              </Card>

              <Card className="p-4">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Mic className="mr-2 h-5 w-5" /> Audio Recording (10s)
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
                    disabled={isRecording}
                  >
                    <Mic className="h-4 w-4" /> Start Recording (10s)
                  </Button>
                  
                  <Button 
                    onClick={handleAnalyzeData} 
                    variant="secondary" 
                    className="gap-2"
                    disabled={!capturedImage || !audioBlob || isAnalyzing}
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
        </Tabs>
      </div>
      
      <div className="container max-w-5xl py-8">
        <div className="bg-black/20 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Model Upload Instructions</h2>
          <p className="mb-3">Please add your trained models to the following directory structure in the public folder:</p>
          <pre className="bg-black/40 p-4 rounded-lg overflow-auto text-sm mb-6">
{`public/models/
|
|_keyfacial/
|   |_best_model.h5
|   |_model_keyfacial_architecture.json
|
|_facial_emotion/
|   |_facial.weights.h5
|   |_model_facial_architecture.json
|
|_speech_emotion/
    |_mlp_model.weights.h5
    |_mlp_mlp_architecture.json
    |_xgb_model.json
    |_stdscaler.pkl
    |_mood_encode.pkl`}
          </pre>
          <p className="text-muted-foreground text-sm">
            After uploading your models to the public folder, the application will attempt to load them automatically.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
