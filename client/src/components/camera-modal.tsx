import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Camera, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CameraModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPillScanned?: (pillInfo: any) => void;
}

export default function CameraModal({ open, onOpenChange, onPillScanned }: CameraModalProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [open]);

  const startCamera = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if camera API is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera not supported on this device");
      }

      // Try different camera configurations
      let mediaStream;
      
      try {
        // First try back camera for mobile
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });
      } catch (backCameraError) {
        // Fall back to any available camera
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });
      }
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
      
    } catch (error: any) {
      console.error('Camera error:', error);
      let errorMessage = "Could not access camera.";
      
      if (error.name === 'NotAllowedError') {
        errorMessage = "Camera permission denied. Please allow camera access and refresh.";
      } else if (error.name === 'NotFoundError') {
        errorMessage = "No camera found on this device.";
      } else if (error.name === 'NotSupportedError') {
        errorMessage = "Camera not supported in this browser.";
      } else if (error.name === 'NotReadableError') {
        errorMessage = "Camera is already in use by another application.";
      }
      
      setError(errorMessage);
      toast({
        title: "Camera Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const captureImage = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsCapturing(true);

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    if (context) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);

      // Convert to blob for processing
      canvas.toBlob(async (blob) => {
        if (blob) {
          // Mock pill recognition - in real app this would call an AI service
          await mockPillRecognition(blob);
        }
        setIsCapturing(false);
      }, 'image/jpeg');
    }
  };

  const mockPillRecognition = async (imageBlob: Blob) => {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock recognition result
    const mockResult = {
      name: "Lisinopril",
      dosage: "10mg",
      shape: "round",
      color: "white",
      confidence: 0.85
    };

    toast({
      title: "Pill Recognized",
      description: `Found: ${mockResult.name} ${mockResult.dosage} (${Math.round(mockResult.confidence * 100)}% confidence)`,
    });

    if (onPillScanned) {
      onPillScanned(mockResult);
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-full max-h-full h-screen bg-black">
        <DialogTitle className="sr-only">Camera Pill Scanner</DialogTitle>
        <div className="relative h-full">
          {/* Header */}
          <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="bg-black/50 text-white hover:bg-black/70"
            >
              <X className="w-5 h-5" />
            </Button>
            <div className="bg-black/50 rounded-lg px-3 py-2">
              <span className="text-white text-sm">Position pill in center</span>
            </div>
          </div>

          {/* Camera Feed */}
          <div className="h-full flex items-center justify-center">
            {error ? (
              <div className="text-center text-white max-w-md px-4">
                <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2 text-red-400">Camera Error</p>
                <p className="text-sm opacity-75 mb-4">{error}</p>
                <Button
                  onClick={startCamera}
                  className="bg-primary hover:bg-primary/90"
                >
                  Try Again
                </Button>
              </div>
            ) : stream ? (
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                muted
              />
            ) : (
              <div className="text-center text-white">
                <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">
                  {isLoading ? "Starting Camera..." : "Camera Loading..."}
                </p>
                <p className="text-sm opacity-75">
                  {isLoading ? "Please wait..." : "Please allow camera access"}
                </p>
              </div>
            )}
          </div>

          {/* Scan Overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-64 h-64 border-4 border-white/50 rounded-lg relative">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg"></div>
            </div>
          </div>

          {/* Capture Button - only show when camera is working */}
          {stream && !error && (
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
              <Button
                onClick={captureImage}
                disabled={isCapturing}
                className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100"
              >
                {isCapturing ? (
                  <RotateCcw className="w-8 h-8 text-primary animate-spin" />
                ) : (
                  <div className="w-12 h-12 bg-primary rounded-full"></div>
                )}
              </Button>
            </div>
          )}

          {/* Hidden canvas for image capture */}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      </DialogContent>
    </Dialog>
  );
}
