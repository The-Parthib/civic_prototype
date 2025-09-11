import React, { useState, useRef, useEffect } from 'react';
import { Camera, RotateCcw, Download, X, RefreshCw } from 'lucide-react';

function CameraTesting() {
  const [source, setSource] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [showCamera, setShowCamera] = useState(false); // New state to force camera view
  const [facingMode, setFacingMode] = useState("environment"); // "environment" for rear, "user" for front
  const [error, setError] = useState("");
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const startCamera = async () => {
    setShowCamera(true); // Immediately show camera interface
    
    try {
      setError("");
      setIsStreaming(false);
      
      console.log("Starting camera...");
      
      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      // Check if mediaDevices is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera not supported in this browser");
      }

      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      console.log("Requesting camera with constraints:", constraints);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log("Camera stream obtained:", stream);
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        console.log("Video source set");
        
        // Wait for the video to load
        videoRef.current.onloadedmetadata = () => {
          console.log("Video metadata loaded");
          videoRef.current.play().then(() => {
            console.log("Video playing successfully");
            setIsStreaming(true);
          }).catch((playError) => {
            console.error("Error playing video:", playError);
            setError("Unable to start camera preview: " + playError.message);
          });
        };

        videoRef.current.onerror = (e) => {
          console.error("Video error:", e);
          setError("Video playback error");
        };
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError(`Unable to access camera: ${err.message}. Please check permissions.`);
      setShowCamera(false); // Hide camera view on error
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
    setShowCamera(false); // Hide camera interface
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
    setIsStreaming(false); // Immediately hide video while switching
    const newFacingMode = facingMode === "environment" ? "user" : "environment";
    
    // Stop current stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    setFacingMode(newFacingMode);
    
    // Small delay to ensure camera is properly released
    setTimeout(async () => {
      try {
        const constraints = {
          video: {
            facingMode: newFacingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play().then(() => {
              setIsStreaming(true);
            }).catch((playError) => {
              console.error("Error playing video:", playError);
              setError("Unable to start camera preview.");
            });
          };
        }
      } catch (err) {
        console.error("Error switching camera:", err);
        setError("Unable to switch camera.");
      }
    }, 300);
  };

  const retakePhoto = () => {
    setSource("");
    setShowCamera(true);
    startCamera();
  };

  const handleFileUpload = (target) => {
    if (target.files && target.files.length > 0) {
      const file = target.files[0];
      const newUrl = URL.createObjectURL(file);
      setSource(newUrl);
      setShowCamera(false);
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

        {!showCamera && !source && (
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

        {showCamera && (
          <div className="h-full relative">
            {/* Show video only when streaming, otherwise show loading */}
            {isStreaming ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'scaleX(1)' }}
              />
            ) : (
              <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                  <div className="text-lg">Starting camera...</div>
                  {error && (
                    <div className="mt-4 text-red-400 text-sm max-w-xs">
                      {error}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Always show video element for stream (hidden when not streaming) */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover absolute top-0 left-0 ${!isStreaming ? 'opacity-0' : 'opacity-100'}`}
              style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'scaleX(1)' }}
            />
            
            {/* Camera controls */}
            <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center space-x-8">
              {/* Switch Camera */}
              <button
                onClick={switchCamera}
                className="bg-gray-800 bg-opacity-75 p-3 rounded-full hover:bg-opacity-100 transition-all"
                disabled={!isStreaming}
              >
                <RefreshCw size={24} />
              </button>
              
              {/* Capture Button */}
              <button
                onClick={capturePhoto}
                className="bg-white p-4 rounded-full hover:bg-gray-200 transition-all shadow-lg"
                disabled={!isStreaming}
              >
                <div className="w-8 h-8 bg-gray-800 rounded-full"></div>
              </button>
              
              {/* Close Camera */}
              <button
                onClick={stopCamera}
                className="bg-gray-800 bg-opacity-75 p-3 rounded-full hover:bg-opacity-100 transition-all"
              >
                <X size={24} />
              </button>
            </div>
            
            {/* Camera mode indicator */}
            <div className="absolute top-4 right-4 bg-black bg-opacity-50 px-3 py-1 rounded text-sm">
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