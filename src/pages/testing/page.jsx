import React, { useState, useRef, useEffect } from 'react';
import { Camera, RotateCcw, Download, X, RefreshCw } from 'lucide-react';

function CameraTesting() {
  const [source, setSource] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [facingMode, setFacingMode] = useState("environment"); // "environment" for rear, "user" for front
  const [error, setError] = useState("");
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const startCamera = async () => {
    try {
      setError("");
      
      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Unable to access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
      setSource(imageDataUrl);
      stopCamera();
    }
  };

  const switchCamera = async () => {
    const newFacingMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(newFacingMode);
    
    if (isStreaming) {
      stopCamera();
      // Small delay to ensure camera is properly released
      setTimeout(() => {
        setFacingMode(newFacingMode);
        startCamera();
      }, 100);
    }
  };

  const retakePhoto = () => {
    setSource("");
    startCamera();
  };

  const handleFileUpload = (target) => {
    if (target.files && target.files.length > 0) {
      const file = target.files[0];
      const newUrl = URL.createObjectURL(file);
      setSource(newUrl);
      stopCamera();
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup on component unmount
      stopCamera();
    };
  }, []);

  return (
    <div className="h-screen bg-black text-white flex flex-col">
      <div className="flex-1 relative">
        <div className="absolute top-4 left-4 z-10">
          <h2 className="text-xl font-semibold">Camera</h2>
        </div>

        {error && (
          <div className="absolute top-16 left-4 right-4 z-10 bg-red-600 text-white p-3 rounded">
            {error}
          </div>
        )}

        {!isStreaming && !source && (
          <div className="h-full flex flex-col items-center justify-center space-y-6">
            <Camera size={64} className="text-blue-400" />
            <h3 className="text-xl">Capture your image</h3>
            <button
              onClick={startCamera}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg flex items-center space-x-2"
            >
              <Camera size={20} />
              <span>Open Camera</span>
            </button>
            
            <div className="text-gray-400">or</div>
            
            <div>
              <input
                accept="image/*"
                className="hidden"
                id="file-upload"
                type="file"
                onChange={(e) => handleFileUpload(e.target)}
              />
              <label htmlFor="file-upload">
                <div className="bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-lg cursor-pointer flex items-center space-x-2">
                  <Download size={20} />
                  <span>Choose from Gallery</span>
                </div>
              </label>
            </div>
          </div>
        )}

        {isStreaming && (
          <div className="h-full relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            
            {/* Camera controls */}
            <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center space-x-8">
              {/* Switch Camera */}
              <button
                onClick={switchCamera}
                className="bg-gray-800 bg-opacity-75 p-3 rounded-full hover:bg-opacity-100"
              >
                <RefreshCw size={24} />
              </button>
              
              {/* Capture Button */}
              <button
                onClick={capturePhoto}
                className="bg-white p-4 rounded-full hover:bg-gray-200"
              >
                <div className="w-8 h-8 bg-gray-800 rounded-full"></div>
              </button>
              
              {/* Close Camera */}
              <button
                onClick={stopCamera}
                className="bg-gray-800 bg-opacity-75 p-3 rounded-full hover:bg-opacity-100"
              >
                <X size={24} />
              </button>
            </div>
            
            {/* Camera mode indicator */}
            <div className="absolute top-4 right-4 bg-black bg-opacity-50 px-3 py-1 rounded">
              {facingMode === "environment" ? "Rear Camera" : "Front Camera"}
            </div>
          </div>
        )}

        {source && (
          <div className="h-full relative">
            <img 
              src={source} 
              alt="Captured" 
              className="w-full h-full object-cover"
            />
            
            {/* Photo controls */}
            <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center space-x-8">
              <button
                onClick={retakePhoto}
                className="bg-gray-800 bg-opacity-75 px-4 py-2 rounded-lg hover:bg-opacity-100 flex items-center space-x-2"
              >
                <RotateCcw size={20} />
                <span>Retake</span>
              </button>
              
              <button
                onClick={() => {
                  // Here you can add logic to save/use the captured image
                  console.log("Photo captured:", source);
                  alert("Photo captured successfully!");
                }}
                className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg"
              >
                Use Photo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export default CameraTesting;