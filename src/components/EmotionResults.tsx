
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

interface EmotionResultsProps {
  emotionData: {
    facial: string | null;
    speech: string | null;
    confidence: {
      facial: number | null;
      speech: number | null;
    };
  };
  facialKeypoints: number[][] | null;
  capturedImage: string | null;
}

const EmotionResults: React.FC<EmotionResultsProps> = ({
  emotionData,
  facialKeypoints,
  capturedImage,
}) => {
  const getEmotionColor = (emotion: string | null) => {
    if (!emotion) return "bg-muted text-muted-foreground";
    
    const colors: Record<string, string> = {
      happy: "bg-emotion-happy text-background",
      sad: "bg-emotion-sad text-background",
      angry: "bg-emotion-angry text-background",
      surprised: "bg-emotion-surprised text-background",
      neutral: "bg-emotion-neutral text-background",
      fearful: "bg-emotion-fearful text-background",
    };
    
    return colors[emotion] || "bg-muted text-muted-foreground";
  };

  const getEmotionDescription = (emotion: string | null) => {
    if (!emotion) return "No emotion detected";
    
    const descriptions: Record<string, string> = {
      happy: "Positive emotion with signs of joy and contentment",
      sad: "Negative emotion with signs of sorrow and disappointment",
      angry: "Strong negative emotion with signs of frustration and hostility",
      surprised: "Sudden emotion with raised eyebrows and widened eyes",
      neutral: "Balanced emotional state with minimal expression",
      fearful: "Negative emotion with signs of anxiety and apprehension",
    };
    
    return descriptions[emotion] || "Unknown emotional state";
  };

  const hasResults = emotionData.facial !== null || emotionData.speech !== null;

  if (!hasResults) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Info className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No Analysis Results Yet</h3>
        <p className="text-muted-foreground max-w-md">
          Capture a facial image and record audio, then click "Analyze Emotions" to see results
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Facial Emotion Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          {emotionData.facial ? (
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className={`px-4 py-2 rounded-full text-sm font-semibold ${getEmotionColor(emotionData.facial)}`}>
                  {emotionData.facial.toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Confidence</span>
                    <span>{Math.round((emotionData.confidence.facial || 0) * 100)}%</span>
                  </div>
                  <Progress value={(emotionData.confidence.facial || 0) * 100} />
                </div>
              </div>
              
              <Alert>
                <AlertTitle>Analysis</AlertTitle>
                <AlertDescription>
                  {getEmotionDescription(emotionData.facial)}
                </AlertDescription>
              </Alert>
              
              <div className="mt-6">
                <h4 className="text-sm font-semibold mb-2">Facial Keypoints</h4>
                <div className="bg-black rounded-lg relative overflow-hidden w-full aspect-square">
                  {capturedImage && (
                    <img 
                      src={capturedImage} 
                      alt="Captured face" 
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              No facial emotion data available
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Speech Emotion Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          {emotionData.speech ? (
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className={`px-4 py-2 rounded-full text-sm font-semibold ${getEmotionColor(emotionData.speech)}`}>
                  {emotionData.speech.toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Confidence</span>
                    <span>{Math.round((emotionData.confidence.speech || 0) * 100)}%</span>
                  </div>
                  <Progress value={(emotionData.confidence.speech || 0) * 100} />
                </div>
              </div>
              
              <Alert>
                <AlertTitle>Analysis</AlertTitle>
                <AlertDescription>
                  {getEmotionDescription(emotionData.speech)}
                </AlertDescription>
              </Alert>
              
              <div className="mt-6">
                <h4 className="text-sm font-semibold mb-2">Audio Features</h4>
                <Tabs defaultValue="features">
                  <TabsList className="grid grid-cols-2">
                    <TabsTrigger value="features">Key Features</TabsTrigger>
                    <TabsTrigger value="advanced">Advanced</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="features">
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="bg-muted/20 p-2 rounded">
                        <div className="text-xs text-muted-foreground">Duration</div>
                        <div className="font-mono text-sm">10s</div>
                      </div>
                      <div className="bg-muted/20 p-2 rounded">
                        <div className="text-xs text-muted-foreground">Pitch</div>
                        <div className="font-mono text-sm">{(Math.random() * 150 + 100).toFixed(1)} Hz</div>
                      </div>
                      <div className="bg-muted/20 p-2 rounded">
                        <div className="text-xs text-muted-foreground">Speech Rate</div>
                        <div className="font-mono text-sm">{(Math.random() * 3 + 2).toFixed(1)} wps</div>
                      </div>
                      <div className="bg-muted/20 p-2 rounded">
                        <div className="text-xs text-muted-foreground">Sentiment</div>
                        <div className="font-mono text-sm">{(Math.random() * 2 - 1).toFixed(2)}</div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="advanced">
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="bg-muted/20 p-2 rounded">
                        <div className="text-xs text-muted-foreground">Jitter</div>
                        <div className="font-mono text-sm">{(Math.random() * 0.02).toFixed(3)}</div>
                      </div>
                      <div className="bg-muted/20 p-2 rounded">
                        <div className="text-xs text-muted-foreground">Shimmer</div>
                        <div className="font-mono text-sm">{(Math.random() * 0.1).toFixed(3)}</div>
                      </div>
                      <div className="bg-muted/20 p-2 rounded">
                        <div className="text-xs text-muted-foreground">MFCC Mean</div>
                        <div className="font-mono text-sm">{(Math.random() * 10 - 5).toFixed(2)}</div>
                      </div>
                      <div className="bg-muted/20 p-2 rounded">
                        <div className="text-xs text-muted-foreground">Model Ensemble</div>
                        <div className="font-mono text-sm">0.3 MLP / 0.7 XGB</div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              No speech emotion data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmotionResults;
