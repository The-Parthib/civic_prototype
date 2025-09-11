import React, { useState, useRef, useEffect } from 'react';
import { Camera, RotateCcw, Download, X, RefreshCw } from 'lucide-react';

function CameraTesting() {
  const [source, setSource] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [showCamera, setShowCamera] = useState(false); // New state to force camera view
  const [facingMode, setFacingMode] = useState("environment"); // "environment" for rear, "user" for front
  const [error, setError] = useState("");
  const [isSwitchingCamera, setIsSwitchingCamera] = useState(false); // New state for camera switching
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
    if (videoRef.current && isStreaming) {
      try {
        const canvas = document.createElement('canvas');
        const video = videoRef.current;
        
        // Wait for video to be ready
        if (video.videoWidth === 0 || video.videoHeight === 0) {
          console.error("Video dimensions not ready");
          setError("Camera not ready. Please try again.");
          return;
        }
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const ctx = canvas.getContext('2d');
        
        // If front camera, flip the image horizontally
        if (facingMode === 'user') {
          ctx.scale(-1, 1);
          ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
        } else {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        }
        
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
        console.log("Image captured, data URL length:", imageDataUrl.length);
        
        setSource(imageDataUrl);
        setShowCamera(false);
        stopCamera();
      } catch (err) {
        console.error("Error capturing photo:", err);
        setError("Failed to capture photo. Please try again.");
      }
    } else {
      console.error("Video not ready for capture");
      setError("Camera not ready. Please try again.");
    }
  };

  const switchCamera = async () => {
    try {
      setIsSwitchingCamera(true); // Show switching indicator
      console.log("Switching camera from", facingMode);
      
      // Determine new facing mode
      const newFacingMode = facingMode === "environment" ? "user" : "environment";
      console.log("New facing mode:", newFacingMode);
      
      // Stop current stream immediately
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          console.log("Stopping track:", track);
          track.stop();
        });
        streamRef.current = null;
      }
      
      // Update facing mode state
      setFacingMode(newFacingMode);
      setIsStreaming(false);
      
      // Small delay to ensure camera is properly released
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Start new camera stream with new facing mode
      const constraints = {
        video: {
          facingMode: newFacingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      console.log("Requesting new camera with constraints:", constraints);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log("New camera stream obtained:", stream);
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        console.log("New video source set");
        
        videoRef.current.onloadedmetadata = () => {
          console.log("New video metadata loaded");
          videoRef.current.play().then(() => {
            console.log("New video playing successfully");
            setIsStreaming(true);
            setIsSwitchingCamera(false); // Hide switching indicator
          }).catch((playError) => {
            console.error("Error playing new video:", playError);
            setError("Unable to start camera preview: " + playError.message);
            setIsSwitchingCamera(false);
          });
        };

        videoRef.current.onerror = (e) => {
          console.error("New video error:", e);
          setError("Video playback error");
          setIsSwitchingCamera(false);
        };
      }
    } catch (err) {
      console.error("Error switching camera:", err);
      setError(`Unable to switch camera: ${err.message}`);
      setIsSwitchingCamera(false);
      
      // Fallback: try to restart with original facing mode
      try {
        const fallbackConstraints = {
          video: {
            facingMode: facingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        };
        const fallbackStream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
        streamRef.current = fallbackStream;
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
          setIsStreaming(true);
        }
      } catch (fallbackErr) {
        console.error("Fallback failed:", fallbackErr);
        setError("Camera switching failed. Please close and reopen camera.");
      }
    }
  };

  const retakePhoto = () => {
    console.log("Retaking photo, clearing source");
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
          <h2 className="text-xl font-semibold">
            {source ? "Captured" : "Camera"}
          </h2>
          {/* Debug info */}
          {source && (
            <div className="text-xs text-gray-400 mt-1">
              Image: {source.substring(0, 50)}...
            </div>
          )}
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
            {isStreaming && !isSwitchingCamera ? (
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
                  <div className="text-lg">
                    {isSwitchingCamera ? "Switching camera..." : "Starting camera..."}
                  </div>
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
              className={`w-full h-full object-cover absolute top-0 left-0 ${(!isStreaming || isSwitchingCamera) ? 'opacity-0' : 'opacity-100'}`}
              style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'scaleX(1)' }}
            />
            
            {/* Camera controls */}
            <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center space-x-8">
              {/* Switch Camera */}
              <button
                onClick={switchCamera}
                className={`bg-gray-800 bg-opacity-75 p-3 rounded-full hover:bg-opacity-100 transition-all ${
                  (!isStreaming || isSwitchingCamera) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={!isStreaming || isSwitchingCamera}
              >
                <RefreshCw size={24} className={isSwitchingCamera ? 'animate-spin' : ''} />
              </button>
              
              {/* Capture Button */}
              <button
                onClick={capturePhoto}
                className={`bg-white p-4 rounded-full hover:bg-gray-200 transition-all shadow-lg ${
                  (!isStreaming || isSwitchingCamera) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={!isStreaming || isSwitchingCamera}
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
              {isSwitchingCamera ? "Switching..." : (facingMode === "environment" ? "Rear Camera" : "Front Camera")}
            </div>
          </div>
        )}

        {source && !showCamera && (
          <div className="h-full relative">
            <div className="w-full h-full flex items-center justify-center bg-black">
              <img 
                src={source} 
                alt="Captured" 
                className="max-w-full max-h-full object-contain"
                onLoad={() => console.log("Image loaded successfully")}
                onError={(e) => {
                  console.error("Image load error:", e);
                  setError("Failed to display captured image");
                }}
              />
            </div>
            
            {/* Photo controls */}
            <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center space-x-8">
              <button
                onClick={retakePhoto}
                className="bg-gray-800 bg-opacity-75 px-4 py-2 rounded-lg hover:bg-opacity-100 flex items-center space-x-2 text-white"
              >
                <RotateCcw size={20} />
                <span>Retake</span>
              </button>
              
              <button
                onClick={() => {
                  // Here you can add logic to save/use the captured image
                  console.log("Photo confirmed:", source);
                  
                  // Create a downloadable link
                  const link = document.createElement('a');
                  link.download = `captured-photo-${Date.now()}.jpg`;
                  link.href = source;
                  link.click();
                  
                  alert("Photo saved successfully!");
                }}
                className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg text-white"
              >
                Use Photo
              </button>
            </div>
            
            {/* Show image info */}
            <div className="absolute top-4 left-4 bg-black bg-opacity-50 px-3 py-1 rounded text-white text-sm">
              Photo Captured
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export default CameraTesting;