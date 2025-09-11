import React, { useState, useRef, useEffect } from 'react';
import { Camera, RotateCcw, Download, X, RefreshCw } from 'lucide-react';

function CameraTesting() {
  const [capturedImage, setCapturedImage] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [facingMode, setFacingMode] = useState("environment");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Clean up streams on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
    setIsLoading(false);
  };

  const startCamera = async () => {
    try {
      setError("");
      setIsLoading(true);
      setShowCamera(true);
      
      // Stop any existing stream
      stopCamera();

      // Request camera access
      const constraints = {
        video: {
          facingMode: facingMode,
          width: { min: 640, ideal: 1280, max: 1920 },
          height: { min: 480, ideal: 720, max: 1080 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Wait for video to be ready
        await new Promise((resolve, reject) => {
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play()
              .then(() => {
                setIsStreaming(true);
                setIsLoading(false);
                resolve();
              })
              .catch(reject);
          };
          videoRef.current.onerror = reject;
        });
      }
    } catch (err) {
      console.error("Camera error:", err);
      setError(`Camera access failed: ${err.message}`);
      setIsLoading(false);
      setShowCamera(false);
    }
  };

  const switchCamera = async () => {
    const newFacingMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(newFacingMode);
    setIsLoading(true);
    setIsStreaming(false);
    
    try {
      // Stop current stream
      stopCamera();
      
      // Small delay to ensure camera is released
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Start with new facing mode
      const constraints = {
        video: {
          facingMode: newFacingMode,
          width: { min: 640, ideal: 1280, max: 1920 },
          height: { min: 480, ideal: 720, max: 1080 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        await new Promise((resolve, reject) => {
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play()
              .then(() => {
                setIsStreaming(true);
                setIsLoading(false);
                resolve();
              })
              .catch(reject);
          };
          videoRef.current.onerror = reject;
        });
      }
    } catch (err) {
      console.error("Switch camera error:", err);
      setError(`Failed to switch camera: ${err.message}`);
      setIsLoading(false);
      // Try to restart with original facing mode
      setFacingMode(facingMode === "environment" ? "user" : "environment");
      startCamera();
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !isStreaming) {
      setError("Camera not ready");
      return;
    }

    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      if (canvas.width === 0 || canvas.height === 0) {
        setError("Video not ready, please wait");
        return;
      }

      const ctx = canvas.getContext('2d');
      
      // Draw video frame to canvas
      if (facingMode === 'user') {
        // Flip horizontally for front camera
        ctx.scale(-1, 1);
        ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
      } else {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }

      // Convert to data URL
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
      
      if (imageDataUrl && imageDataUrl.length > 1000) {
        setCapturedImage(imageDataUrl);
        setShowCamera(false);
        stopCamera();
      } else {
        setError("Failed to capture image");
      }
    } catch (err) {
      console.error("Capture error:", err);
      setError("Failed to capture photo");
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setError("");
    startCamera();
  };

  const closeCamera = () => {
    stopCamera();
    setShowCamera(false);
    setError("");
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadImage = () => {
    if (capturedImage) {
      const link = document.createElement('a');
      link.download = `photo-${Date.now()}.jpg`;
      link.href = capturedImage;
      link.click();
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Main Screen - Choose option */}
      {!showCamera && !capturedImage && (
        <div className="h-screen flex flex-col items-center justify-center p-6">
          <div className="text-center space-y-8">
            <Camera size={80} className="text-blue-400 mx-auto" />
            <h1 className="text-2xl font-bold">Capture Image</h1>
            
            {error && (
              <div className="bg-red-600 text-white p-3 rounded-lg max-w-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <button
                onClick={startCamera}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-medium flex items-center justify-center space-x-3"
              >
                <Camera size={24} />
                <span>Open Camera</span>
              </button>
              
              <div className="text-gray-400">or</div>
              
              <label className="block">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="w-full bg-gray-700 hover:bg-gray-600 text-white px-8 py-4 rounded-lg text-lg font-medium flex items-center justify-center space-x-3 cursor-pointer">
                  <Download size={24} />
                  <span>Choose from Gallery</span>
                </div>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Camera Interface */}
      {showCamera && (
        <div className="h-screen relative bg-black">
          {/* Header */}
          <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center">
            <h2 className="text-xl font-semibold">Camera</h2>
            <button
              onClick={closeCamera}
              className="bg-black bg-opacity-50 p-2 rounded-full"
            >
              <X size={24} />
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="absolute top-16 left-4 right-4 z-20 bg-red-600 text-white p-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Video Stream or Loading */}
          <div className="h-full flex items-center justify-center">
            {isStreaming ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{
                  transform: facingMode === 'user' ? 'scaleX(-1)' : 'none'
                }}
              />
            ) : (
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
                <p className="text-lg">{isLoading ? "Loading camera..." : "Camera starting..."}</p>
              </div>
            )}
          </div>

          {/* Controls */}
          {isStreaming && (
            <div className="absolute bottom-8 left-0 right-0 z-20">
              <div className="flex justify-center items-center space-x-8">
                {/* Switch Camera */}
                <button
                  onClick={switchCamera}
                  disabled={isLoading}
                  className="bg-gray-800 bg-opacity-75 p-4 rounded-full hover:bg-opacity-100 disabled:opacity-50"
                >
                  <RefreshCw size={24} className={isLoading ? 'animate-spin' : ''} />
                </button>
                
                {/* Capture Button */}
                <button
                  onClick={capturePhoto}
                  disabled={isLoading}
                  className="bg-white p-6 rounded-full shadow-lg hover:bg-gray-100 disabled:opacity-50"
                >
                  <div className="w-6 h-6 bg-black rounded-full"></div>
                </button>
                
                {/* Gallery Button */}
                <label className="bg-gray-800 bg-opacity-75 p-4 rounded-full hover:bg-opacity-100 cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Download size={24} />
                </label>
              </div>
              
              {/* Camera Mode Indicator */}
              <div className="text-center mt-4">
                <span className="bg-black bg-opacity-50 px-3 py-1 rounded-full text-sm">
                  {facingMode === 'environment' ? 'Rear Camera' : 'Front Camera'}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Image Preview */}
      {capturedImage && (
        <div className="h-screen relative bg-black">
          {/* Header */}
          <div className="absolute top-4 left-4 right-4 z-20">
            <h2 className="text-xl font-semibold">Photo Preview</h2>
          </div>

          {/* Image Display */}
          <div className="h-full flex items-center justify-center p-4">
            <img
              src={capturedImage}
              alt="Captured"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>

          {/* Controls */}
          <div className="absolute bottom-8 left-0 right-0 z-20">
            <div className="flex justify-center items-center space-x-6">
              <button
                onClick={retakePhoto}
                className="bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-lg flex items-center space-x-2"
              >
                <RotateCcw size={20} />
                <span>Retake</span>
              </button>
              
              <button
                onClick={downloadImage}
                className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg flex items-center space-x-2"
              >
                <Download size={20} />
                <span>Download</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CameraTesting;