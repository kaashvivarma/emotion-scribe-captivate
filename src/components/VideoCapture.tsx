
import React, { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera, RefreshCw } from "lucide-react";

interface VideoCaptureProps {
  onCapture: (imageData: string) => void;
  isRecording: boolean;
  capturedImage: string | null;
  facialKeypoints: number[][] | null;
}

const VideoCapture: React.FC<VideoCaptureProps> = ({ 
  onCapture, 
  isRecording,
  capturedImage,
  facialKeypoints
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { 
            width: { ideal: 96 },
            height: { ideal: 96 }
          }
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setStream(mediaStream);
        setHasPermission(true);
      } catch (error) {
        console.error("Error accessing camera:", error);
        setHasPermission(false);
      }
    };

    if (!capturedImage) {
      startCamera();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [capturedImage]);

  useEffect(() => {
    if (isRecording && videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/png');
        onCapture(imageData);
      }
    }
  }, [isRecording, onCapture]);

  const handleRetake = () => {
    onCapture("");
  };

  const drawFacialKeypoints = (ctx: CanvasRenderingContext2D) => {
    if (!facialKeypoints) return;
    
    ctx.strokeStyle = '#4ade80'; // Green color
    ctx.fillStyle = '#4ade80';
    ctx.lineWidth = 1;
    
    // Connect points with lines to form facial features
    const features = [
      // Jaw line
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
      // Right eyebrow
      [17, 18, 19, 20, 21],
      // Left eyebrow
      [22, 23, 24, 25, 26],
      // Nose bridge
      [27, 28, 29, 30],
      // Lower nose
      [30, 31, 32, 33, 34, 35],
      // Right eye
      [36, 37, 38, 39, 40, 41, 36],
      // Left eye
      [42, 43, 44, 45, 46, 47, 42],
      // Outer lip
      [48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 48],
      // Inner lip
      [60, 61, 62, 63, 64, 65, 66, 67, 60]
    ];
    
    features.forEach(feature => {
      ctx.beginPath();
      for (let i = 0; i < feature.length; i++) {
        const idx = feature[i];
        if (facialKeypoints[idx]) {
          const [x, y] = facialKeypoints[idx];
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
      }
      ctx.stroke();
    });
    
    // Draw points
    facialKeypoints.forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(x, y, 1, 0, 2 * Math.PI);
      ctx.fill();
    });
  };

  useEffect(() => {
    if (capturedImage && facialKeypoints && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          drawFacialKeypoints(ctx);
        };
        img.src = capturedImage;
      }
    }
  }, [capturedImage, facialKeypoints]);

  return (
    <div className="flex flex-col items-center">
      <div className="bg-black relative w-96 h-96 overflow-hidden rounded-lg">
        {!capturedImage ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        ) : null}
        
        <canvas
          ref={canvasRef}
          width={96}
          height={96}
          className={`absolute top-0 left-0 w-full h-full object-cover ${capturedImage ? 'block' : 'hidden'}`}
        />
        
        {hasPermission === false && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-white p-4 text-center">
            <p>Camera access denied. Please grant permission to use your camera.</p>
          </div>
        )}
      </div>

      <div className="mt-4 flex justify-center">
        {capturedImage ? (
          <Button onClick={handleRetake} variant="secondary" className="gap-2">
            <RefreshCw className="h-4 w-4" /> Retake
          </Button>
        ) : (
          <p className="text-sm text-muted-foreground">
            Video feed will be captured when recording starts
          </p>
        )}
      </div>
    </div>
  );
};

export default VideoCapture;
