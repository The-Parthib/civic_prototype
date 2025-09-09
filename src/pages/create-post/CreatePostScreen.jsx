import React, { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import { Camera, Image, X, ArrowLeft, Mic, MicOff, Send } from "lucide-react";
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
  const [showCamera, setShowCamera] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

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

  // Gallery images for demo (in real app, these would come from device gallery)
  const galleryImages = [
    "/placeholder.svg",
    "/placeholder.svg",
    "/placeholder.svg",
    "/placeholder.svg",
    "/placeholder.svg",
    "/placeholder.svg",
  ];

  // Initialize camera view
  const openCamera = () => {
    setShowCamera(true);
    setShowGallery(false);
  };

  // Open gallery view
  const openGallery = () => {
    setShowGallery(true);
    setShowCamera(false);
  };

  // Capture photo from webcam
  const capturePhoto = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setCapturedImage(imageSrc);
      setShowCamera(false);
      setShowTextInput(true);
    }
  }, [webcamRef]);

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
  };

  // Initial Camera/Gallery Selection Screen
  if (!showCamera && !showGallery && !showTextInput) {
    return (
      <div className="min-h-screen bg-black flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 text-white">
          <button
            onClick={() => navigate("/home")}
            className="p-2 rounded-full hover:bg-gray-800"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-semibold">Create Report</h1>
          <div className="w-10"></div>
        </div>

        {/* Gallery Strip at Top */}
        <div className="px-4 mb-4">
          <div className="flex space-x-2 overflow-x-auto">
            {galleryImages.map((image, index) => (
              <button
                key={index}
                onClick={() => selectGalleryImage(image)}
                className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border border-gray-600"
              >
                <img
                  src={image}
                  alt={`Gallery ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
            <button
              onClick={openGallery}
              className="flex-shrink-0 w-12 h-12 rounded-lg border border-gray-600 flex items-center justify-center"
            >
              <Image size={20} className="text-white" />
            </button>
          </div>
        </div>

        {/* Camera Preview Area */}
        <div className="flex-1 relative">
          <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
            <div className="text-center text-white">
              <Camera size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg">Tap to take a photo</p>
              <p className="text-sm opacity-75 mt-1">
                or select from gallery above
              </p>
            </div>
          </div>
          <button
            onClick={openCamera}
            className="absolute inset-0 w-full h-full"
          />
        </div>

        {/* Bottom Controls */}
        <div className="p-6">
          <div className="flex items-center justify-between">
            <button
              onClick={openGallery}
              className="p-4 rounded-full bg-gray-800 text-white"
            >
              <Image size={24} />
            </button>

            <button
              onClick={openCamera}
              className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-lg"
            >
              <div className="w-16 h-16 rounded-full bg-white border-4 border-gray-300"></div>
            </button>

            <button
              onClick={() => setShowTextInput(true)}
              className="p-4 rounded-full bg-gray-800 text-white"
            >
              <Send size={24} />
            </button>
          </div>

          <div className="text-center mt-4">
            <button
              onClick={() => setShowTextInput(true)}
              className="text-white text-sm underline"
            >
              Skip and add text only
            </button>
          </div>
        </div>

        <BottomNavigation />
      </div>
    );
  }

  // Camera View
  if (showCamera) {
    return (
      <div className="fixed inset-0 bg-black z-50">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 text-white">
            <button
              onClick={() => setShowCamera(false)}
              className="p-2 rounded-full hover:bg-gray-800"
            >
              <X size={24} />
            </button>
            <h1 className="text-lg font-semibold">Take Photo</h1>
            <div className="w-10"></div>
          </div>

          {/* Camera */}
          <div className="flex-1 relative">
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Bottom Controls */}
          <div className="p-6">
            <div className="flex items-center justify-center">
              <button
                onClick={capturePhoto}
                className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-lg"
              >
                <div className="w-16 h-16 rounded-full bg-white border-4 border-gray-300"></div>
              </button>
            </div>
          </div>
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
                  setShowTextInput(false);
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
