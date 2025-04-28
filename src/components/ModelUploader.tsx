
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, Check, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface ModelUploaderProps {
  onModelsLoaded: (status: boolean) => void;
}

interface ModelFile {
  name: string;
  description: string;
  path: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
}

const ModelUploader: React.FC<ModelUploaderProps> = ({ onModelsLoaded }) => {
  const [modelFiles, setModelFiles] = useState<ModelFile[]>([
    { 
      name: "Facial Keypoint Model", 
      description: "Detects 68 facial keypoints",
      path: "model/keyfacial", 
      status: 'pending', 
      progress: 0 
    },
    { 
      name: "Facial Emotion Model", 
      description: "Classifies facial expressions into emotions",
      path: "model/facial_emotion", 
      status: 'pending', 
      progress: 0 
    },
    { 
      name: "Speech Emotion Model", 
      description: "Ensemble model (MLP + XGBoost) for speech emotion",
      path: "model/speech_emotion", 
      status: 'pending', 
      progress: 0 
    },
  ]);
  
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // This is where you'd typically handle the file uploads
    // For this demo, we'll simulate the upload process
    if (!event.target.files || event.target.files.length === 0) return;
    
    setIsLoading(true);
    
    // Simulate upload progress for each model
    let completed = 0;
    
    setModelFiles(prev => prev.map(model => ({
      ...model,
      status: 'uploading',
      progress: 0
    })));
    
    // Simulate progress updates for each model
    modelFiles.forEach((model, index) => {
      const duration = 1500 + Math.random() * 1500; // Random duration between 1.5-3s
      const interval = 100;
      let progress = 0;
      
      const timer = setInterval(() => {
        progress += (interval / duration) * 100;
        
        if (progress >= 100) {
          clearInterval(timer);
          progress = 100;
          completed++;
          
          setModelFiles(prev => {
            const updated = [...prev];
            updated[index] = {
              ...updated[index],
              status: 'success',
              progress: 100
            };
            return updated;
          });
          
          if (completed === modelFiles.length) {
            setIsLoading(false);
            onModelsLoaded(true);
            toast({
              title: "Models uploaded successfully",
              description: "All models are ready to use for emotion analysis",
            });
          }
        } else {
          setModelFiles(prev => {
            const updated = [...prev];
            updated[index] = {
              ...updated[index],
              progress: Math.min(99, progress) // Cap at 99% until complete
            };
            return updated;
          });
        }
      }, interval);
    });
  };

  const handleLoadDemo = () => {
    // Simulate loading pre-trained demo models
    setIsLoading(true);
    
    setModelFiles(prev => prev.map(model => ({
      ...model,
      status: 'uploading',
      progress: 0
    })));
    
    // Simulate progress for demo model loading
    let count = 0;
    const interval = setInterval(() => {
      count++;
      
      setModelFiles(prev => prev.map((model, i) => ({
        ...model,
        progress: Math.min(100, count * 20),
        status: count * 20 >= 100 ? 'success' : 'uploading'
      })));
      
      if (count >= 5) {
        clearInterval(interval);
        setIsLoading(false);
        onModelsLoaded(true);
        toast({
          title: "Demo models loaded successfully",
          description: "Pre-trained models are ready to use for emotion analysis",
        });
      }
    }, 500);
  };

  const allModelsLoaded = modelFiles.every(model => model.status === 'success');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI Model Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {modelFiles.map((model, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between">
                <div>
                  <h4 className="text-sm font-medium">{model.name}</h4>
                  <p className="text-xs text-muted-foreground">{model.description}</p>
                </div>
                {model.status === 'success' && <Check className="h-5 w-5 text-green-500" />}
                {model.status === 'error' && <AlertCircle className="h-5 w-5 text-destructive" />}
                {model.status === 'uploading' && <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />}
              </div>
              <Progress value={model.progress} />
              <p className="text-xs text-muted-foreground">
                Path: <span className="font-mono">{model.path}</span>
              </p>
            </div>
          ))}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={() => document.getElementById('file-upload')?.click()}
            disabled={isLoading}
            className="w-full sm:w-auto gap-2"
          >
            <Upload className="h-4 w-4" /> Upload Models
          </Button>
          <input
            id="file-upload"
            type="file"
            multiple
            onChange={handleFileChange}
            className="hidden"
            accept=".h5,.json,.pkl"
          />
          <Button 
            variant="secondary" 
            onClick={handleLoadDemo}
            disabled={isLoading || allModelsLoaded}
            className="w-full sm:w-auto"
          >
            Load Demo Models
          </Button>
        </CardFooter>
      </Card>
      
      <div className="text-sm text-muted-foreground">
        <p className="mb-2">Expected model structure:</p>
        <pre className="bg-muted p-4 rounded-md overflow-auto text-xs">
{`model/
├─ keyfacial/
│  ├─ best_model.h5
│  ├─ model_keyfacial_architecture.json
├─ facial_emotion/
│  ├─ facial.weights.h5
│  ├─ model_facial_architecture.json
└─ speech_emotion/
   ├─ mlp_model.weights.h5
   ├─ mlp_mlp_architecture.json
   ├─ xgb_model.json
   ├─ stdscaler.pkl
   └─ mood_encode.pkl`}
        </pre>
      </div>
    </div>
  );
};

export default ModelUploader;
