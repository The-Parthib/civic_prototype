import React, { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Camera,
  Image,
  X,
  ArrowLeft,
  Mic,
  MicOff,
  Send,
  RotateCw,
  RefreshCw,
  Download,
} from "lucide-react";
import BottomNavigation from "../../components/BottomNavigation";
import { BackgroundAnalysisService } from "../../services/backgroundAnalysis";
import {
  reportNotifications,
  initializeNotifications,
} from "../../utils/reportNotifications";

const CreatePostScreen = () => {
  const navigate = useNavigate();
  const webcamRef = useRef(null);

  // State for camera interface
  const [showCamera, setShowCamera] = useState(true); // start with camera visible
  const [showGallery, setShowGallery] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [facingMode, setFacingMode] = useState("environment"); // "user" for front, "environment" for back
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [streamRef, setStreamRef] = useState(null);
  const videoRef = useRef(null);

  // State for text description
  const [showTextInput, setShowTextInput] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // State for voice recording
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);

  // State for submission
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for camera management
  const [availableCameras, setAvailableCameras] = useState([]);
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);
  const [cameraError, setCameraError] = useState(null);

  // Empty gallery array - removed placeholders
  const galleryImages = [];

  // Start camera automatically on component mount and clean up on unmount
  useEffect(() => {
    openCamera();
    return () => stopCamera();
  }, []);

  const stopCamera = () => {
    if (streamRef) {
      streamRef.getTracks().forEach(track => track.stop());
      setStreamRef(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
    setIsLoading(false);
  };

  // Initialize camera view
  const openCamera = async () => {
    if (isLoading || isStreaming) return; // prevent duplicate in-flight
    try {
      setCameraError("");
      setIsLoading(true);
      setShowCamera(true);
      setShowTextInput(false);
      setShowGallery(false);
      
      // Stop any existing stream
      stopCamera();

      // Add a timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        console.error("Camera loading timeout. Please try again.");
        setIsLoading(false);
      }, 8000); // 8 second timeout

      // Request camera access
      const constraints = {
        video: {
          facingMode: facingMode,
          width: { min: 640, ideal: 1280, max: 1920 },
          height: { min: 480, ideal: 720, max: 1080 }
        }
      };

  console.log("Requesting camera access...", constraints);
  const stream = await navigator.mediaDevices.getUserMedia(constraints).catch(err => { throw err; });
      console.log("Camera stream obtained");
      
      setStreamRef(stream);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        console.log("Video srcObject set");
        
        // Force video to start immediately
        videoRef.current.play().catch(err => {
          console.log("Initial play failed, trying after metadata:", err);
        });
        
        // Simple event handlers
        videoRef.current.onloadedmetadata = () => {
          console.log("Video metadata loaded, dimensions:", 
            videoRef.current.videoWidth, "x", videoRef.current.videoHeight);
          clearTimeout(timeoutId);
          
          videoRef.current.play().then(() => {
            console.log("Video started playing successfully");
            setIsStreaming(true);
            setIsLoading(false);
          }).catch((err) => {
            console.error("Play error:", err);
            // Try to show video anyway
            setIsStreaming(true);
            setIsLoading(false);
          });
        };
        
        videoRef.current.oncanplay = () => {
          console.log("Video can play");
          setIsStreaming(true);
          setIsLoading(false);
        };
        
        videoRef.current.onerror = (err) => {
          console.error("Video error:", err);
          clearTimeout(timeoutId);
          setCameraError("Video playback error");
          setIsLoading(false);
        };
      }
    } catch (err) {
      console.error("Camera error:", err);
      console.error(`Camera access failed: ${err.message}`);
      setIsLoading(false);
      setShowCamera(false);
    }
  };

  // Switch between front and back camera
  const switchCamera = async () => {
    const newFacingMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(newFacingMode);
    setIsLoading(true);
    setIsStreaming(false);
    
    try {
      console.log("Switching camera to:", newFacingMode);
      
      // Stop current stream
      if (streamRef) {
        streamRef.getTracks().forEach(track => track.stop());
        setStreamRef(null);
      }
      
      // Small delay to ensure camera is released
      setTimeout(async () => {
        try {
          const constraints = {
            video: {
              facingMode: newFacingMode,
              width: { min: 640, ideal: 1280, max: 1920 },
              height: { min: 480, ideal: 720, max: 1080 }
            }
          };

          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          setStreamRef(stream);

          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            console.log("New camera srcObject set");
            
            // Force video to start immediately
            videoRef.current.play().catch(err => {
              console.log("New camera initial play failed:", err);
            });
            
            videoRef.current.onloadedmetadata = () => {
              console.log("New camera metadata loaded");
              videoRef.current.play().then(() => {
                console.log("New camera started playing");
                setIsStreaming(true);
                setIsLoading(false);
              }).catch((err) => {
                console.error("New camera play error:", err);
                // Try to show video anyway
                setIsStreaming(true);
                setIsLoading(false);
              });
            };
            
            videoRef.current.oncanplay = () => {
              console.log("New camera can play");
              setIsStreaming(true);
              setIsLoading(false);
            };
          }
        } catch (err) {
          console.error("Switch camera error:", err);
          console.error(`Failed to switch camera: ${err.message}`);
          setIsLoading(false);
        }
      }, 500);
      
    } catch (err) {
      console.error("Switch error:", err);
      console.error("Camera switch failed");
      setIsLoading(false);
    }
  };

  // Open gallery view
  const openGallery = () => {
    stopCamera();
    setShowGallery(true);
    setShowCamera(false);
  };

  // Capture photo from camera
  const capturePhoto = () => {
    if (!videoRef.current || !isStreaming) {
      setCameraError("Camera not ready");
      return;
    }

    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      if (canvas.width === 0 || canvas.height === 0) {
        console.error("Video not ready, please wait");
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
        setShowTextInput(true);
      } else {
        console.error("Failed to capture image");
      }
    } catch (err) {
      console.error("Capture error:", err);
      console.error("Failed to capture photo");
    }
  };

  // Close camera
  const closeCamera = () => {
    stopCamera();
    setShowCamera(false);
  };

  // Handle file upload from input
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target.result);
        setShowGallery(false);
        setShowTextInput(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle gallery image selection (demo)
  const selectGalleryImage = (imageSrc) => {
    setSelectedImage(imageSrc);
    setShowGallery(false);
    setShowTextInput(true);
  };

  // Start voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const audioChunks = [];

      recorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudio(audioUrl);
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
      alert("Could not access microphone. Please check permissions.");
    }
  };

  // Stop voice recording
  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };

  // Remove recorded audio
  const removeAudio = () => {
    if (recordedAudio) {
      URL.revokeObjectURL(recordedAudio);
      setRecordedAudio(null);
    }
  };

  // Submit the report
  const submitReport = async () => {
    if (!title.trim() && !description.trim()) {
      alert("Please provide a title or description for your report.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Get user info
      const storedUser = sessionStorage.getItem("civicName");
      const user = storedUser ? JSON.parse(storedUser) : {};

      // Create complaint object
      const complaint = {
        id: Date.now().toString(),
        userId: user.id || "anonymous",
        title: title.trim() || "Voice/Image Report",
        details:
          description.trim() || "Report submitted with voice/image content",
        category: null,
        department: null,
        photo: selectedImage || capturedImage,
        capturedImage: capturedImage,
        selectedImage: selectedImage,
        voiceRecording: recordedAudio,
        status: "Submitted",
        priority: "medium",
        assignedTo: null,
        needsAnalysis: true,
        location: {
          address: "Ranchi Municipal Corporation Area",
          municipality: user.municipality,
          district: user.district,
          state: user.state,
          pincode: "834001",
          coordinates: {
            latitude: 23.3441,
            longitude: 85.3096,
          },
        },
        userInfo: {
          name: user.name || "Anonymous",
          email: user.email || "",
          phone: user.phone || "",
          municipality: user.municipality,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        adminComments: [],
        aiAnalysis: {
          contextAssessment: null,
          questions: [],
          answers: {},
          departmentAllocation: null,
          processed: false,
        },
      };

      // Submit to server
      const response = await fetch(
        `https://jansamadhan-json-server.onrender.com/complaints`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(complaint),
        }
      );

      if (response.ok) {
        const responseData = await response.json();
        const reportId = responseData.id || complaint.id;

        // Initialize notifications
        await initializeNotifications();

        // Send background processing notification
        await reportNotifications.notifyBackgroundProcessing(
          reportId,
          complaint.title
        );

        // Navigate to report details
        navigate(`/report/${reportId}`);

        // Trigger background analysis
        setTimeout(() => {
          BackgroundAnalysisService.analyzeReport(reportId, complaint);
        }, 2000);
      } else {
        throw new Error("Failed to submit report");
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("Failed to submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset to initial state
  const resetForm = () => {
    setCapturedImage(null);
    setSelectedImage(null);
    setTitle("");
    setDescription("");
    removeAudio();
    setShowCamera(false);
    setShowGallery(false);
    setShowTextInput(false);
    stopCamera();
    setFacingMode("environment");
  };

  // Removed initial loading screen; camera view will render immediately

  // Camera View
  if (showCamera) {
    return (
      <div className="fixed inset-0 bg-black z-50">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center text-white">
            <button
              onClick={() => {
                stopCamera();
                navigate(-1);
              }}
              className="bg-black bg-opacity-50 p-2 rounded-full"
              aria-label="Close"
            >
              <X size={24} />
            </button>
            <h1 className="text-lg font-semibold">Take Photo</h1>
            <button
              onClick={switchCamera}
              disabled={isLoading}
              className="bg-black bg-opacity-50 p-2 rounded-full disabled:opacity-50"
            >
              <RefreshCw size={24} className={isLoading ? 'animate-spin' : ''} />
            </button>
            {/* Optional quick text-only report button (small) */}
          </div>

          {/* No error display in UI as requested */}

          {/* Video Stream or Loading */}
          <div className="h-full relative">
            {/* Always show video element */}
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
            
            {/* Loading overlay */}
            {!isStreaming && (
              <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
                  <p className="text-lg">{isLoading ? "Loading camera..." : "Camera starting..."}</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Facing: {facingMode} | Streaming: {isStreaming ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          {isStreaming && (
            <div className="absolute bottom-6 left-0 right-0 z-20 select-none">
              <div className="flex items-center justify-between px-8">
                {/* Upload / Gallery Button (typical camera style) */}
                <label
                  className="w-14 h-14 rounded-lg overflow-hidden bg-gray-800 bg-opacity-60 flex items-center justify-center cursor-pointer border border-gray-600 active:scale-95 transition"
                  title="Upload from device"
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  {selectedImage || capturedImage ? (
                    <img
                      src={selectedImage || capturedImage}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Download size={24} className="text-white opacity-80" />
                  )}
                </label>

                {/* Capture Button */}
                <button
                  onClick={capturePhoto}
                  disabled={isLoading || !isStreaming}
                  className="relative w-24 h-24 rounded-full flex items-center justify-center disabled:opacity-50 active:scale-95 transition"
                  aria-label="Capture photo"
                >
                  <span className="absolute inset-0 rounded-full bg-white/80 backdrop-blur-sm" />
                  <span className="w-16 h-16 bg-white rounded-full border-4 border-gray-300" />
                </button>

                {/* Switch Camera */}
                <button
                  onClick={switchCamera}
                  disabled={isLoading}
                  className="w-14 h-14 rounded-full bg-gray-800 bg-opacity-60 flex items-center justify-center hover:bg-opacity-80 disabled:opacity-50 active:scale-95 transition"
                  aria-label="Switch camera"
                >
                  <RefreshCw size={26} className={isLoading ? 'animate-spin' : 'text-white'} />
                </button>
              </div>

              {/* Camera Mode Indicator */}
              <div className="mt-3 text-center">
                <span className="inline-block bg-black bg-opacity-60 px-3 py-1 rounded-full text-xs tracking-wide text-white/90">
                  {facingMode === 'environment' ? 'Rear Camera' : 'Front Camera'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Gallery View
  if (showGallery) {
    return (
      <div className="min-h-screen bg-gray-100 pb-20">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={() => setShowGallery(false)}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-lg font-semibold">Select Photo</h1>
            <div className="w-10"></div>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="p-4">
          <div className="grid grid-cols-3 gap-2">
            {galleryImages.map((image, index) => (
              <button
                key={index}
                onClick={() => selectGalleryImage(image)}
                className="aspect-square rounded-lg overflow-hidden border border-gray-300"
              >
                <img
                  src={image}
                  alt={`Gallery ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* File Input */}
        <div className="p-4">
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="block w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-blue-400"
          >
            <Camera className="mx-auto mb-2 text-gray-400" size={24} />
            <span className="text-gray-600">Choose from device</span>
          </label>
        </div>

        <BottomNavigation />
      </div>
    );
  }

  // Text Input View
  if (showTextInput) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={() => {
                if (capturedImage || selectedImage) {
                  // Go back to camera view
                  setShowTextInput(false);
                  setShowCamera(true);
                  // Start camera again
                  openCamera();
                } else {
                  resetForm();
                }
              }}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-lg font-semibold">Describe Issue</h1>
            <button
              onClick={submitReport}
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Image Preview */}
          {(capturedImage || selectedImage) && (
            <div className="relative">
              <img
                src={capturedImage || selectedImage}
                alt="Selected"
                className="w-full h-48 object-cover rounded-lg border"
              />
              <button
                onClick={() => {
                  setCapturedImage(null);
                  setSelectedImage(null);
                  setShowTextInput(false);
                  setShowCamera(true);
                  openCamera();
                }}
                className="absolute top-2 right-2 p-1 bg-black bg-opacity-50 text-white rounded-full"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Title Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Issue Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief title describing the issue"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Description Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the problem in detail..."
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Voice Recording */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Voice Note (Optional)
            </label>

            {!recordedAudio ? (
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`flex items-center justify-center space-x-2 w-full p-4 border-2 border-dashed rounded-lg ${
                  isRecording
                    ? "border-red-400 bg-red-50 text-red-600"
                    : "border-gray-300 text-gray-600 hover:border-blue-400"
                }`}
              >
                {isRecording ? (
                  <>
                    <MicOff size={20} />
                    <span>Stop Recording</span>
                  </>
                ) : (
                  <>
                    <Mic size={20} />
                    <span>Record Voice Note</span>
                  </>
                )}
              </button>
            ) : (
              <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <audio controls className="flex-1">
                  <source src={recordedAudio} type="audio/wav" />
                  Your browser does not support audio playback.
                </audio>
                <button
                  onClick={removeAudio}
                  className="p-1 text-red-600 hover:bg-red-100 rounded"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>
        </div>

        <BottomNavigation />
      </div>
    );
  }

  return null;
};

export default CreatePostScreen;
