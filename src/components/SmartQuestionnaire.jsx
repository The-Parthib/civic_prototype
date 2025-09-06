import React, { useState } from 'react';
import { Bot, User, Send, Loader } from 'lucide-react';

const port = import.meta.env.VITE_DB_PORT || 5000;
const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;

const SmartQuestionnaire = ({ onResults, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [userInput, setUserInput] = useState('');

  const questions = [
    {
      id: 'problem_type',
      text: 'What type of issue are you facing?',
      type: 'multiple',
      options: ['Infrastructure', 'Utilities', 'Public Services', 'Environmental', 'Administrative', 'Other']
    },
    {
      id: 'location_specific',
      text: 'Is this problem specific to a particular location or area?',
      type: 'text',
      placeholder: 'Describe the location (e.g., near school, main road, residential area)'
    },
    {
      id: 'urgency',
      text: 'How urgent is this issue?',
      type: 'multiple',
      options: ['Emergency (immediate danger)', 'High (affects daily life)', 'Medium (inconvenient)', 'Low (can wait)']
    },
    {
      id: 'description',
      text: 'Please describe the problem in detail',
      type: 'textarea',
      placeholder: 'Provide as much detail as possible about the issue you are experiencing'
    },
    {
      id: 'duration',
      text: 'How long has this problem been occurring?',
      type: 'multiple',
      options: ['Just started', 'Few days', 'About a week', 'Several weeks', 'Months', 'Ongoing issue']
    }
  ];

  const departments = [
    { 
      id: "1", 
      name: "Municipal Works", 
      category: "Roads",
      keywords: ["road", "street", "construction", "infrastructure", "building", "maintenance", "bridge", "footpath", "sidewalk", "pavement", "pothole", "crack", "repair", "renovation", "pathway", "highway", "lane", "junction", "traffic", "signal", "zebra", "crossing"],
      urgencyKeywords: ["collapse", "danger", "accident", "blocked", "emergency"]
    },
    { 
      id: "2", 
      name: "Water Dept", 
      category: "Water",
      keywords: ["water", "supply", "leak", "pipe", "drainage", "sewage", "plumbing", "tap", "faucet", "bore", "well", "tank", "pump", "overflow", "contamination", "quality", "pressure", "flow", "burst", "blockage", "manhole", "drain"],
      urgencyKeywords: ["contaminated", "burst", "flooding", "no water", "sewage overflow", "toxic"]
    },
    { 
      id: "3", 
      name: "Electricity Dept", 
      category: "Electricity",
      keywords: ["power", "electricity", "light", "cable", "outage", "electrical", "transformer", "pole", "wire", "current", "voltage", "meter", "connection", "short circuit", "fuse", "switch", "panel", "grid", "supply", "cut", "blackout"],
      urgencyKeywords: ["fire", "sparking", "electrocution", "dangerous", "exposed wire", "shock"]
    },
    { 
      id: "4", 
      name: "Sanitation Dept", 
      category: "Sanitation",
      keywords: ["garbage", "waste", "cleaning", "sanitation", "dirty", "trash", "dustbin", "collection", "disposal", "litter", "dump", "refuse", "sweeping", "hygiene", "smell", "odor", "flies", "rats", "pest", "toilet", "washroom"],
      urgencyKeywords: ["health hazard", "disease", "epidemic", "toxic waste", "medical waste"]
    },
    { 
      id: "5", 
      name: "General Admin", 
      category: "Other",
      keywords: ["document", "certificate", "admin", "office", "service", "general", "complaint", "grievance", "application", "form", "process", "procedure", "policy", "rule", "regulation", "staff", "officer", "department", "inquiry"],
      urgencyKeywords: ["urgent", "immediate", "emergency service"]
    }
  ];

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      processWithAI();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const processWithAI = async () => {
    setIsProcessing(true);
    
    try {
      // Prepare the context for Gemini
      const problemContext = `
User's complaint details:
- Problem Type: ${answers.problem_type}
- Location: ${answers.location_specific}
- Urgency: ${answers.urgency}
- Description: ${answers.description}
- Duration: ${answers.duration}

Available Departments:
${departments.map(dept => `- ${dept.name}: handles ${dept.keywords.join(', ')}`).join('\n')}

Based on the user's complaint, determine:
1. The most appropriate department to handle this issue
2. Priority level (emergency, high, medium, low)
3. A brief analysis of why this department was selected
4. Suggested category from: [Roads, Water, Electricity, Sanitation, Other]

Respond in JSON format:
{
  "department": "department_name",
  "category": "category_name", 
  "priority": "priority_level",
  "analysis": "brief explanation",
  "confidence": "percentage"
}
`;

      let selectedDepartment = "General Admin";
      let selectedCategory = "Other";
      let priority = "medium";
      let analysis = "Based on keyword analysis";
      let confidence = "75%";

      // If Gemini API key is available, use AI processing
      if (geminiApiKey) {
        try {
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: problemContext
                }]
              }]
            })
          });

          if (response.ok) {
            const data = await response.json();
            const aiResponse = data.candidates[0].content.parts[0].text;
            
            // Parse AI response
            try {
              const aiResults = JSON.parse(aiResponse.replace(/```json\n?|\n?```/g, ''));
              selectedDepartment = aiResults.department;
              selectedCategory = aiResults.category;
              priority = aiResults.priority;
              analysis = aiResults.analysis;
              confidence = aiResults.confidence;
            } catch (parseError) {
              console.log('AI response parsing failed, using fallback logic');
              // Fallback to keyword matching
              const results = performKeywordMatching();
              selectedDepartment = results.department;
              selectedCategory = results.category;
              priority = results.priority;
              confidence = results.confidence + "%";
              analysis = `AI parsing failed - using keyword analysis: ${results.confidence}% confidence`;
            }
          }
        } catch (apiError) {
          console.log('Gemini API call failed, using fallback logic');
          // Fallback to keyword matching
          const results = performKeywordMatching();
          selectedDepartment = results.department;
          selectedCategory = results.category;
          priority = results.priority;
          confidence = results.confidence + "%";
          analysis = `Keyword-based analysis: ${results.confidence}% confidence match`;
        }
      } else {
        // Fallback keyword-based matching when no API key
        const results = performKeywordMatching();
        selectedDepartment = results.department;
        selectedCategory = results.category;
        priority = results.priority;
        confidence = results.confidence + "%";
        analysis = `Keyword-based analysis: ${results.confidence}% confidence match`;
      }

      // Prepare final results
      const results = {
        department: selectedDepartment,
        category: selectedCategory,
        priority: priority,
        analysis: analysis,
        confidence: confidence,
        answers: answers,
        questionnaire: {
          problemType: answers.problem_type,
          location: answers.location_specific,
          urgency: answers.urgency,
          description: answers.description,
          duration: answers.duration
        }
      };

      onResults(results);

    } catch (error) {
      console.error('Error processing questionnaire:', error);
      
      // Fallback processing
      const results = performKeywordMatching();
      onResults({
        department: results.department,
        category: results.category,
        priority: results.priority,
        analysis: `Error occurred - using keyword analysis: ${results.confidence}% confidence`,
        confidence: results.confidence + "%",
        answers: answers,
        questionnaire: {
          problemType: answers.problem_type,
          location: answers.location_specific,
          urgency: answers.urgency,
          description: answers.description,
          duration: answers.duration
        }
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const performKeywordMatching = () => {
    const allText = `${answers.problem_type} ${answers.description} ${answers.location_specific}`.toLowerCase();
    
    let bestMatch = departments[4]; // Default to General Admin
    let maxScore = 0;
    let detectedPriority = "medium";

    departments.forEach(dept => {
      // Calculate keyword score (main keywords)
      const keywordScore = dept.keywords.reduce((acc, keyword) => {
        const count = (allText.match(new RegExp(keyword.toLowerCase(), 'g')) || []).length;
        return acc + count;
      }, 0);
      
      // Calculate urgency score
      const urgencyScore = dept.urgencyKeywords.reduce((acc, keyword) => {
        return acc + (allText.includes(keyword.toLowerCase()) ? 2 : 0); // Higher weight for urgency
      }, 0);
      
      const totalScore = keywordScore + urgencyScore;
      
      if (totalScore > maxScore) {
        maxScore = totalScore;
        bestMatch = dept;
        
        // Determine priority based on urgency keywords and user's urgency selection
        if (urgencyScore > 0 || answers.urgency?.includes('Emergency')) {
          detectedPriority = "high";
        } else if (answers.urgency?.includes('High')) {
          detectedPriority = "high";
        } else if (answers.urgency?.includes('Low')) {
          detectedPriority = "low";
        }
      }
    });

    // Special logic for specific problem types
    if (answers.problem_type === 'Infrastructure') {
      bestMatch = departments.find(d => d.name === "Municipal Works") || bestMatch;
    } else if (answers.problem_type === 'Utilities') {
      // Check if it's more likely water or electricity
      if (allText.includes('water') || allText.includes('pipe') || allText.includes('drain')) {
        bestMatch = departments.find(d => d.name === "Water Dept") || bestMatch;
      } else if (allText.includes('power') || allText.includes('electric') || allText.includes('light')) {
        bestMatch = departments.find(d => d.name === "Electricity Dept") || bestMatch;
      }
    } else if (answers.problem_type === 'Environmental') {
      bestMatch = departments.find(d => d.name === "Sanitation Dept") || bestMatch;
    }

    return {
      department: bestMatch.name,
      category: bestMatch.category,
      priority: detectedPriority,
      confidence: maxScore > 0 ? Math.min(90, 60 + (maxScore * 10)) : 50
    };
  };

  const currentQuestion = questions[currentStep];
  const isLastStep = currentStep === questions.length - 1;
  const currentAnswer = answers[currentQuestion?.id] || '';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-blue-800 text-white p-4 flex items-center">
          <Bot className="mr-3" size={24} />
          <div>
            <h2 className="text-xl font-bold">Smart Complaint Assistant</h2>
            <p className="text-blue-200 text-sm">
              AI-powered department selection • Step {currentStep + 1} of {questions.length}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="bg-gray-200 h-2">
          <div 
            className="bg-blue-600 h-2 transition-all duration-300"
            style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-6">
          {!isProcessing ? (
            <>
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">
                  {currentQuestion.text}
                </h3>
                
                {currentQuestion.type === 'multiple' && (
                  <div className="space-y-2">
                    {currentQuestion.options.map((option, index) => (
                      <label key={index} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="radio"
                          name={currentQuestion.id}
                          value={option}
                          checked={currentAnswer === option}
                          onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                          className="mr-3 text-blue-600"
                        />
                        <span className="text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                )}

                {currentQuestion.type === 'text' && (
                  <input
                    type="text"
                    value={currentAnswer}
                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                    placeholder={currentQuestion.placeholder}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}

                {currentQuestion.type === 'textarea' && (
                  <textarea
                    value={currentAnswer}
                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                    placeholder={currentQuestion.placeholder}
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                )}
              </div>

              {/* Navigation buttons */}
              <div className="flex justify-between">
                <button
                  onClick={onCancel}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                
                <div className="flex space-x-3">
                  {currentStep > 0 && (
                    <button
                      onClick={handlePrevious}
                      className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Previous
                    </button>
                  )}
                  
                  <button
                    onClick={handleNext}
                    disabled={!currentAnswer}
                    className={`px-6 py-2 rounded-lg transition-colors flex items-center ${
                      currentAnswer
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {isLastStep ? (
                      <>
                        <Bot className="mr-2" size={16} />
                        Process with AI
                      </>
                    ) : (
                      'Next'
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="flex justify-center mb-4">
                <Loader className="animate-spin text-blue-600" size={48} />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Processing with AI...
              </h3>
              <p className="text-gray-600">
                Analyzing your responses and selecting the best department
              </p>
              
              {/* Processing steps */}
              <div className="mt-6 space-y-2 text-sm text-gray-500">
                <div className="flex items-center justify-center">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                  Analyzing problem description
                </div>
                <div className="flex items-center justify-center">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                  Matching with department capabilities
                </div>
                <div className="flex items-center justify-center">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                  Determining priority level
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SmartQuestionnaire;
