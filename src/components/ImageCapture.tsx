
import React, { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera, RefreshCw } from "lucide-react";

interface ImageCaptureProps {
  onCapture: (imageData: string) => void;
  capturedImage: string | null;
}

const ImageCapture: React.FC<ImageCaptureProps> = ({ 
  onCapture, 
  capturedImage
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

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/png');
        onCapture(imageData);
        
        // Stop the camera stream after capture
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
      }
    }
  };

  const handleRetake = () => {
    onCapture("");
  };

  useEffect(() => {
    if (capturedImage && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        const img = new Image();
        img.onload = () => {
          // Clear the canvas before drawing
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // Draw the captured image
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        img.src = capturedImage;
      }
    }
  }, [capturedImage]);

  return (
    <div className="flex flex-col items-center">
      <div className="bg-black relative w-96 h-96 overflow-hidden rounded-lg">
        {!capturedImage ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-0 right-0 flex justify-center">
              <Button onClick={captureImage} className="gap-2">
                <Camera className="h-4 w-4" /> Capture Image
              </Button>
            </div>
          </>
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
            Please capture a 96x96 image for facial emotion analysis
          </p>
        )}
      </div>
    </div>
  );
};

export default ImageCapture;
