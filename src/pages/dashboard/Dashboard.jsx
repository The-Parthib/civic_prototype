"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Webcam from "react-webcam";
import { useNavigate } from "react-router-dom";
import SmartQuestionnaire from "../../components/SmartQuestionnaire";
import { determineDepartment } from "../../services/aiService";
import { Bot, LogOut, Menu, X, Loader2 } from "lucide-react";
import axios from "axios";

const categories = ["Roads", "Water", "Electricity", "Sanitation", "Other"];
const departments = [
  "Municipal Works",
  "Water Dept",
  "Electricity Dept",
  "Sanitation Dept",
  "General Admin",
];

const departmentsRef = [
  {
    id: "1",
    name: "Municipal Works",
    category: "Roads",
    keywords: [
      "road",
      "street",
      "construction",
      "infrastructure",
      "building",
      "maintenance",
      "bridge",
      "footpath",
      "sidewalk",
      "pavement",
      "pothole",
      "crack",
      "repair",
      "renovation",
      "pathway",
      "highway",
      "lane",
      "junction",
      "traffic",
      "signal",
      "zebra",
      "crossing",
    ],
    urgencyKeywords: ["collapse", "danger", "accident", "blocked", "emergency"],
  },
  {
    id: "2",
    name: "Water Dept",
    category: "Water",
    keywords: [
      "water",
      "supply",
      "leak",
      "pipe",
      "drainage",
      "sewage",
      "plumbing",
      "tap",
      "faucet",
      "bore",
      "well",
      "tank",
      "pump",
      "overflow",
      "contamination",
      "quality",
      "pressure",
      "flow",
      "burst",
      "blockage",
      "manhole",
      "drain",
    ],
    urgencyKeywords: [
      "contaminated",
      "burst",
      "flooding",
      "no water",
      "sewage overflow",
      "toxic",
    ],
  },
  {
    id: "3",
    name: "Electricity Dept",
    category: "Electricity",
    keywords: [
      "power",
      "electricity",
      "light",
      "cable",
      "outage",
      "electrical",
      "transformer",
      "pole",
      "wire",
      "current",
      "voltage",
      "meter",
      "connection",
      "short circuit",
      "fuse",
      "switch",
      "panel",
      "grid",
      "supply",
      "cut",
      "blackout",
    ],
    urgencyKeywords: [
      "fire",
      "sparking",
      "electrocution",
      "dangerous",
      "exposed wire",
      "shock",
    ],
  },
  {
    id: "4",
    name: "Sanitation Dept",
    category: "Sanitation",
    keywords: [
      "garbage",
      "waste",
      "cleaning",
      "sanitation",
      "dirty",
      "trash",
      "dustbin",
      "collection",
      "disposal",
      "litter",
      "dump",
      "refuse",
      "sweeping",
      "hygiene",
      "smell",
      "odor",
      "flies",
      "rats",
      "pest",
      "toilet",
      "washroom",
    ],
    urgencyKeywords: [
      "health hazard",
      "disease",
      "epidemic",
      "toxic waste",
      "medical waste",
    ],
  },
  {
    id: "5",
    name: "General Admin",
    category: "Other",
    keywords: [
      "document",
      "certificate",
      "admin",
      "office",
      "service",
      "general",
      "complaint",
      "grievance",
      "application",
      "form",
      "process",
      "procedure",
      "policy",
      "rule",
      "regulation",
      "staff",
      "officer",
      "department",
      "inquiry",
    ],
    urgencyKeywords: ["urgent", "immediate", "emergency service"],
  },
];

// Gemini API configuration
const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY; // Replace with your API key or use env variable
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;

const Dashboard = () => {
  // State variables
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [category, setCategory] = useState("");
  const [department, setDepartment] = useState("");
  const [photo, setPhoto] = useState(null);
  const [photoMethod, setPhotoMethod] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [showSmartQuestionnaire, setShowSmartQuestionnaire] = useState(false);
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [aiResults, setAiResults] = useState(null);
  // NEW: complaints listing state
  const [complaints, setComplaints] = useState([]);
  const [complaintsLoading, setComplaintsLoading] = useState(false);
  const [complaintsError, setComplaintsError] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // New state variables for questionnaire flow
  const [isAskingQuestions, setIsAskingQuestions] = useState(false);
  const [aiQuestions, setAiQuestions] = useState([]);
  const [questionAnswers, setQuestionAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isFetchingQuestions, setIsFetchingQuestions] = useState(false);
  const [municipalStructure, setMunicipalStructure] = useState(null);
  const [isProcessingAllocation, setIsProcessingAllocation] = useState(false);

  const webcamRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = sessionStorage.getItem("civicName");
    const user = storedUser ? JSON.parse(storedUser) : {};
    if (!user) {
      navigate("/login");
    }
    console.log(user);
  }, []);

  // NEW: fetch the user's complaints on mount (by email from sessionStorage)
  useEffect(() => {
    const stored = sessionStorage.getItem("civicName");
    const u = stored ? JSON.parse(stored) : null;
    if (u?.email) {
      fetchComplaintsForUser(u.email);
    }
  }, []);

  const port = import.meta.env.VITE_DB_PORT || 5000;

  // NEW: reset form helper
  const resetForm = () => {
    setTitle("");
    setDetails("");
    setCategory("");
    setDepartment("");
    setPhoto(null);
    setCapturedImage(null);
    setPhotoMethod(null);
    setAiResults(null);
    setFormErrors({});
    setShowSmartQuestionnaire(false);
  };

  // NEW: fetch complaints for a given email (from JSON Server at :3000)
  const fetchComplaintsForUser = async (email) => {
    if (!email) return;
    setComplaintsLoading(true);
    setComplaintsError("");
    try {
      const res = await fetch(
        `http://localhost:3000/complaints?userInfo.email=${encodeURIComponent(
          email
        )}`
      );
      if (!res.ok) throw new Error("Failed to fetch complaints");
      const data = await res.json();
      setComplaints(Array.isArray(data) ? data : []);
    } catch (err) {
      setComplaintsError(err.message || "Failed to fetch complaints");
    } finally {
      setComplaintsLoading(false);
    }
  };

  // Function to call Gemini API
  const callGeminiApi = async (prompt) => {
    try {
      const payload = {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_NONE",
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_NONE",
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
        },
      };

      const response = await axios.post(GEMINI_API_URL, payload);
      const jsonText = response.data.candidates[0].content.parts[0].text;

      // Parse the JSON string into a JavaScript object
      return JSON.parse(jsonText);
    } catch (error) {
      console.error(
        "Error calling Gemini API:",
        error.response?.data || error.message
      );
      throw error;
    }
  };

  // Function to fetch municipal structure
  const fetchMunicipalStructure = async () => {
    try {
      const response = await fetch(`http://localhost:${port}/createDepartment`);
      if (!response.ok) throw new Error("Failed to fetch departments");

      const departments = await response.json();
      // Format the departments into the structure expected by the Gemini API
      const formattedStructure = {
        Municipal: {
          departments: departments.map((dept) => ({
            name: dept.name,
            responsibility: Array.isArray(dept.responsibilities)
              ? dept.responsibilities
              : [dept.responsibility],
            department_head_uid: dept.department_head_uid,
            staffs: Array.isArray(dept.staffs) ? dept.staffs : [],
          })),
        },
      };

      setMunicipalStructure(formattedStructure);
      return formattedStructure;
    } catch (error) {
      console.error("Error fetching municipal structure:", error);
      return null;
    }
  };

  // Function to generate questions based on initial input
  const generateClarifyingQuestions = async () => {
    setIsFetchingQuestions(true);

    try {
      // Define initial context clearing questions
      const initialQuestions = [
        "What is the nature of the issue?",
        "Where is the issue located?",
        "Does the issue affect an individual or a community?",
        "How urgent is this issue?",
      ];

      const refinementPrompt = `
        User input: "${title}"
        Additional details: "${details}"
        Context clearing questions: ${JSON.stringify(initialQuestions)}
        
        Based on the user's input, identify which of the context questions remain unanswered. 
        Then, generate a list of 3-5 specific, direct questions to ask the user to get the missing information about this civic issue.
        Return your response as a JSON array of strings. For example: ["What is the exact street address?", "How many households are affected?"]
      `;

      const refinedQuestions = await callGeminiApi(refinementPrompt);
      setAiQuestions(Array.isArray(refinedQuestions) ? refinedQuestions : []);
      setCurrentQuestionIndex(0);
      setQuestionAnswers({});
      setIsAskingQuestions(true);

      return refinedQuestions;
    } catch (error) {
      console.error("Error generating questions:", error);
      return [];
    } finally {
      setIsFetchingQuestions(false);
    }
  };

  // Function to allocate department and staff based on all information
  const allocateDepartmentAndStaff = async (answers) => {
    setIsProcessingAllocation(true);

    try {
      // Get the municipal structure if not already fetched
      const structure = municipalStructure || (await fetchMunicipalStructure());
      if (!structure) throw new Error("Could not fetch municipal structure");

      const classificationPrompt = `
        User's initial report title: "${title}"
        User's detailed description: "${details}"
        User's answers to clarifying questions: ${JSON.stringify(answers)}
        Municipal structure: ${JSON.stringify(structure)}
        
        Based on all the provided information, classify the issue and assign it to the most appropriate department and staff member.
        Your response must be a single JSON object with the following keys:
        - "departmentName": The most appropriate department from the municipal structure
        - "staffId": The most appropriate staff member's ID
        - "category": One of [${categories.join(", ")}]
        - "priority": Either "low", "medium", or "high"
        - "confidence": Either "low", "medium", or "high" indicating your confidence in this assignment
        - "summary": A brief summary of the issue

        For example: {"departmentName": "Public Works", "staffId": 1, "category": "Roads", "priority": "high", "confidence": "high", "summary": "Pothole reported on Main Street that poses accident risk."}
      `;

      const allocation = await callGeminiApi(classificationPrompt);

      // Save the questionnaire and allocation data
      const questionaryPayload = {
        id: Date.now().toString(),
        title,
        details,
        hasImage: !!(photo || capturedImage),
        questions: aiQuestions,
        answers: answers,
        timestamp: new Date().toISOString(),
      };

      await fetch(`http://localhost:${port}/questionaries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(questionaryPayload),
      });

      // Save the allocation with the questionnaire data included
      const allocationPayload = {
        id: Date.now().toString(),
        title,
        details,
        hasImage: !!(photo || capturedImage),
        department: allocation.departmentName,
        category: allocation.category,
        priority: allocation.priority,
        confidence: allocation.confidence,
        staffId: allocation.staffId,
        analysis: allocation.summary,
        timestamp: new Date().toISOString(),
        // Include the questionnaire data in the allocation payload
        questionnaire: questionaryPayload,
      };

      await fetch(`http://localhost:${port}/allocatedDepartment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(allocationPayload),
      });

      return allocation;
    } catch (error) {
      console.error("Error allocating department:", error);
      throw error;
    } finally {
      setIsProcessingAllocation(false);
    }
  };

  // Handle answering a question
  const handleAnswerQuestion = (answer) => {
    // Update the answers for the current question
    setQuestionAnswers((prev) => ({
      ...prev,
      [aiQuestions[currentQuestionIndex]]: answer,
    }));

    // If this is not the last question, move to the next one
    if (currentQuestionIndex < aiQuestions.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    } else {
      // This is the last question, process all answers
      completeQuestionnaire();
    }
  };

  // Complete the questionnaire and proceed
  const completeQuestionnaire = async () => {
    setIsAskingQuestions(false);

    try {
      // Process the answers and allocate department
      const allocation = await allocateDepartmentAndStaff(questionAnswers);

      // Update the form with AI results
      setAiResults(allocation);
      setCategory(allocation.category);
      setDepartment(allocation.departmentName);

      // If AI confidence is low, show traditional questionnaire
      if (allocation.confidence === "low") {
        setShowSmartQuestionnaire(true);
      } else {
        // Otherwise proceed with submission
        submitComplaint(
          allocation.category,
          allocation.departmentName,
          allocation.staffId,
          allocation.priority
        );
      }
    } catch (error) {
      console.error("Error processing questionnaire:", error);
      // If AI fails, show traditional questionnaire
      setShowSmartQuestionnaire(true);
    }
  };

  // Function to handle form field change
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Clear validation errors when field is updated
    setFormErrors({
      ...formErrors,
      [name]: undefined,
    });

    // Update state based on input name
    switch (name) {
      case "title":
        setTitle(value);
        break;
      case "details":
        setDetails(value);
        break;
      case "category":
        setCategory(value);
        break;
      case "department":
        setDepartment(value);
        break;
      default:
        break;
    }
  };

  // Function to handle photo upload
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onloadend = () => {
        setPhoto(reader.result);
        setPhotoMethod("upload");
      };

      reader.readAsDataURL(file);
    }
  };

  // Function to capture image from webcam
  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setCapturedImage(imageSrc);
      setPhotoMethod("camera");
      setShowCamera(false);
    }
  }, [webcamRef]);

  // Function to validate the form
  const validateForm = () => {
    const errors = {};
    if (!title.trim()) errors.title = "Title is required";
    if (!details.trim()) errors.details = "Details are required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    // First, generate clarifying questions
    try {
      await generateClarifyingQuestions();
    } catch (error) {
      console.error("Could not generate questions:", error);
      // Fall back to the traditional AI analysis
      setIsAIProcessing(true);
      try {
        const result = await determineDepartment(
          title,
          details,
          photo || capturedImage,
          departmentsRef
        );
        setAiResults(result);
        setCategory(result.category);
        setDepartment(result.department);

        if (result.confidence === "low") {
          setShowSmartQuestionnaire(true);
          setIsAIProcessing(false);
          return;
        }

        submitComplaint(result.category, result.department);
      } catch (error) {
        console.error("AI analysis failed:", error);
        setIsAIProcessing(false);
        setShowSmartQuestionnaire(true);
      }
    }
  };

  // Modified function to submit complaint with staffId
  const submitComplaint = async (
    selectedCategory,
    selectedDepartment,
    staffId = null,
    priority = "medium"
  ) => {
    // Get user info from sessionStorage
    const storedUser = sessionStorage.getItem("civicName");
    const user = storedUser ? JSON.parse(storedUser) : {};

    // Create complaint object
    const complaint = {
      id: Date.now().toString(),
      userId: user.id || "anonymous",
      title,
      details,
      category: selectedCategory,
      department: selectedDepartment,
      photo: photo || capturedImage,
      photoMethod,
      capturedImage,
      status: "Submitted",
      priority: priority || aiResults?.priority || "medium",
      assignedTo: staffId || null,
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
    };

    try {
      // Send complaint to server
      const response = await fetch(`http://localhost:${port}/complaints`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(complaint),
      });

      if (response.ok) {
        alert("Complaint submitted successfully!");
        resetForm();
        if (user?.email) {
          fetchComplaintsForUser(user.email);
        }
      } else {
        console.log("Failed to submit complaint. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting complaint:", error);
    } finally {
      setIsAIProcessing(false);
      setIsProcessingAllocation(false);
    }
  };

  // Handle smart questionnaire results
  const handleSmartQuestionnaireResults = (results) => {
    setShowSmartQuestionnaire(false);
    setCategory(results.category);
    setDepartment(results.department);
    submitComplaint(results.category, results.department);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("civicName");
    navigate("/login");
  };

  // NEW: small card component to render complaint mini view
  const ComplaintCard = ({ item }) => {
    const imgSrc = item?.photo || item?.capturedImage;
    return (
      <div className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
        <div className="flex flex-col sm:flex-row items-start gap-3">
          {imgSrc ? (
            <img
              src={imgSrc || "/placeholder.svg"}
              alt={item?.title || "Complaint"}
              className="w-full sm:w-20 h-32 sm:h-20 object-cover rounded flex-shrink-0"
            />
          ) : (
            <div className="w-full sm:w-20 h-32 sm:h-20 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-500 flex-shrink-0">
              No Image
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm sm:text-base truncate">
              {item?.title}
            </h4>
            <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-3">
              {(item?.details || "").slice(0, 120)}
              {item?.details && item.details.length > 120 ? "..." : ""}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <span className="px-2 py-1 bg-gray-100 rounded text-center truncate">
                {item?.category || "-"}
              </span>
              <span className="px-2 py-1 bg-gray-100 rounded text-center truncate">
                {item?.department || "-"}
              </span>
              <span
                className={`px-2 py-1 rounded text-center truncate ${
                  item?.status === "Submitted"
                    ? "bg-yellow-100 text-yellow-800"
                    : item?.status === "In Progress"
                    ? "bg-blue-100 text-blue-800"
                    : item?.status === "Resolved"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100"
                }`}
              >
                {item?.status || "-"}
              </span>
              <span
                className={`px-2 py-1 rounded text-center truncate ${
                  item?.priority === "high"
                    ? "bg-red-100 text-red-800"
                    : item?.priority === "medium"
                    ? "bg-yellow-100 text-yellow-800"
                    : item?.priority === "low"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100"
                }`}
              >
                {item?.priority || "-"}
              </span>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {item?.createdAt
                ? new Date(item.createdAt).toLocaleDateString()
                : "-"}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Title */}
            <div className="flex items-center">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Civic Portal
              </h1>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome,{" "}
                {JSON.parse(sessionStorage.getItem("civicName") || "{}")
                  ?.name || "User"}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4">
              <div className="flex flex-col space-y-3">
                <span className="text-sm text-gray-600 px-2">
                  Welcome,{" "}
                  {JSON.parse(sessionStorage.getItem("civicName") || "{}")
                    ?.name || "User"}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-2 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors w-full text-left"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Report a Problem
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Submit your civic complaints and track their progress
          </p>
        </div>

        {(isAIProcessing || isFetchingQuestions || isProcessingAllocation) && (
          <div className="mb-6 p-4 bg-blue-50 text-blue-800 rounded-lg flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-800 mr-2"></div>
            {isFetchingQuestions
              ? "Generating questions..."
              : isProcessingAllocation
              ? "Please wait..."
              : "Submitting your complaint..."}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={title}
                onChange={handleChange}
                placeholder="Brief title describing the issue"
                className={`w-full p-3 border rounded-lg text-sm sm:text-base ${
                  formErrors.title ? "border-red-500" : "border-gray-300"
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
              {formErrors.title && (
                <p className="mt-1 text-red-500 text-sm">{formErrors.title}</p>
              )}
            </div>

            {/* Details Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Problem Details
              </label>
              <textarea
                name="details"
                value={details}
                onChange={handleChange}
                placeholder="Describe the problem in detail"
                rows={4}
                className={`w-full p-3 border rounded-lg text-sm sm:text-base ${
                  formErrors.details ? "border-red-500" : "border-gray-300"
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
              {formErrors.details && (
                <p className="mt-1 text-red-500 text-sm">
                  {formErrors.details}
                </p>
              )}
            </div>

            {/* Hidden Category and Department Fields (filled by AI) */}
            <div className="hidden">
              <input type="hidden" name="category" value={category} />
              <input type="hidden" name="department" value={department} />
            </div>

            {/* Display AI-detected department if available */}
            {(category || department) && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start">
                  <Bot
                    className="mr-2 text-green-600 mt-1 flex-shrink-0"
                    size={18}
                  />
                  <div className="flex-1">
                    <p className="font-medium text-green-800 text-sm sm:text-base">
                      Department automatically selected
                    </p>
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {category && (
                        <div className="bg-white p-2 rounded border">
                          <p className="text-xs text-gray-500">Category</p>
                          <p className="font-medium text-sm">{category}</p>
                        </div>
                      )}
                      {department && (
                        <div className="bg-white p-2 rounded border">
                          <p className="text-xs text-gray-500">Department</p>
                          <p className="font-medium text-sm">{department}</p>
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowSmartQuestionnaire(true)}
                      className="mt-3 text-xs text-blue-600 hover:underline flex items-center"
                    >
                      Not the right department? Help us choose better
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Photo (Optional)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCamera(true);
                    setCapturedImage(null);
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
                >
                  📷 Take a Photo
                </button>
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label
                    htmlFor="photo-upload"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer inline-flex items-center justify-center text-sm font-medium transition-colors"
                  >
                    📁 Upload Photo
                  </label>
                </div>
              </div>

              {/* Preview captured or uploaded image */}
              {(capturedImage || photo) && (
                <div className="mt-4">
                  <p className="mb-2 text-sm font-medium text-gray-700">
                    Photo Preview
                  </p>
                  <div className="relative inline-block">
                    <img
                      src={capturedImage || photo}
                      alt="Preview"
                      className="max-h-48 sm:max-h-60 rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setCapturedImage(null);
                        setPhoto(null);
                        setPhotoMethod(null);
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50"
                disabled={isAIProcessing}
              >
                {isAIProcessing ? "Submitting..." : "Submit Complaint"}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
            Your Complaints
          </h3>

          {complaintsLoading && (
            <div className="p-4 bg-gray-50 border rounded-lg text-center text-gray-600">
              Loading your complaints...
            </div>
          )}

          {complaintsError && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {complaintsError}
            </div>
          )}

          {!complaintsLoading &&
            !complaintsError &&
            complaints.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>No complaints found.</p>
                <p className="text-sm mt-1">
                  Submit your first complaint above to get started.
                </p>
              </div>
            )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {complaints.map((c) => (
              <ComplaintCard key={c.id} item={c} />
            ))}
          </div>
        </div>
      </main>

      {showCamera && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="text-lg sm:text-xl font-bold">Take a Photo</h2>
            </div>
            <div className="p-4">
              <div className="camera-container">
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  className="w-full rounded-lg"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-between gap-3 p-4 border-t">
              <button
                onClick={() => setShowCamera(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={capture}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Capture Photo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Smart Questionnaire Modal */}
      {showSmartQuestionnaire && (
        <SmartQuestionnaire
          onResults={handleSmartQuestionnaireResults}
          onCancel={() => setShowSmartQuestionnaire(false)}
          initialData={{ title, details, photo: photo || capturedImage }}
        />
      )}

      {/* AI Questionnaire Modal */}
        {isAskingQuestions && aiQuestions.length > 0 && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 back"
            style={{
          background: "rgba(255,255,255,0.25)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
            }}
          >
            <div className="bg-white bg-opacity-80 backdrop-blur-md rounded-lg shadow-lg w-full max-w-md max-h-[80vh] overflow-hidden border border-gray-200"
          style={{
            boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
            background: "rgba(255,255,255,0.7)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.18)",
          }}
            >
          <div className="p-4 border-b">
            <div className="flex items-center space-x-2">
              <Bot size={18} className="text-blue-600" />
              <h2 className="text-lg font-bold">
            Please provide more details
              </h2>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              To better assist you, please answer the following questions:
            </p>
          </div>

          <div className="p-4">
            <div className="space-y-4">
              <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-semibold text-blue-700">
                Question {currentQuestionIndex + 1} of{" "}
                {aiQuestions.length}
              </span>
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {currentQuestionIndex === aiQuestions.length - 1
              ? "Last question"
              : ""}
              </span>
            </div>
            <p className="text-gray-800">
              {aiQuestions[currentQuestionIndex]}
            </p>
              </div>

              <div>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Type your answer here..."
              value={
                questionAnswers[aiQuestions[currentQuestionIndex]] || ""
              }
              onChange={(e) => {
                setQuestionAnswers((prev) => ({
              ...prev,
              [aiQuestions[currentQuestionIndex]]: e.target.value,
                }));
              }}
            ></textarea>
              </div>
            </div>
          </div>

          <div className="flex justify-between p-4 border-t">
            <button
              onClick={() => setIsAskingQuestions(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg"
            >
              Skip Questions
            </button>
            <button
              onClick={() =>
            handleAnswerQuestion(
              questionAnswers[aiQuestions[currentQuestionIndex]] || ""
            )
              }
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              {currentQuestionIndex === aiQuestions.length - 1 ? (
            <>Submit Answers</>
              ) : (
            <>Next Question</>
              )}
            </button>
          </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default Dashboard;