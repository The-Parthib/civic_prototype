import { useState } from "react";
import { Bot, X } from "lucide-react";

const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;

const SmartQuestionnaire = ({
  onResults,
  onCancel,
  aiQuestions = null,
  initialData = {},
}) => {
  const [answers, setAnswers] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

  // Default questions if AI didn't provide any
  const defaultQuestions = [
    {
      id: "issue_nature",
      text: "What is the nature of the issue? (e.g., water leak, power outage, road damage, sanitation problem)",
    },
    {
      id: "location",
      text: "Where is the issue located? (address, landmark, GPS coordinates if available)",
    },
    {
      id: "scope",
      text: "Is this an individual problem or affecting multiple people/locations?",
    },
    {
      id: "urgency",
      text: "Is this an urgent/emergency issue or a routine civic problem?",
    },
  ];

  // Use AI provided questions or default ones
  const questions = aiQuestions || defaultQuestions;

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSubmit = async () => {
    setIsProcessing(true);
    try {
      // Create an enhanced prompt with user's answers
      const enhancedPrompt = `
Original Complaint:
Title: ${initialData.title || "N/A"}
Details: ${initialData.details || "N/A"}

Additional Information:
${Object.entries(answers)
  .map(([id, answer]) => {
    const question = questions.find((q) => q.id === id);
    return `${question?.text || id}: ${answer}`;
  })
  .join("\n")}

Based on ALL of this information, determine the most appropriate department and category.
      `;

      if (geminiApiKey) {
        // Call Gemini API with enhanced prompt
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: enhancedPrompt,
                    },
                  ],
                },
              ],
              generation_config: {
                temperature: 0.2,
                max_output_tokens: 2048,
              },
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

          // Try to extract department/category from AI response
          let department = "General Admin";
          let category = "Other";

          // Try to parse JSON if the response is in that format
          try {
            const jsonMatch =
              aiResponse.match(/```json\n?([\s\S]*?)\n?```/) ||
              aiResponse.match(/{[\s\S]*?}/);
            if (jsonMatch) {
              const jsonData = JSON.parse(
                jsonMatch[0].replace(/```json\n?|```/g, "")
              );
              department = jsonData.department || department;
              category = jsonData.category || category;
            }
          } catch (e) {
            // If JSON parsing fails, try to extract from text
            if (aiResponse.includes("Department:")) {
              const deptMatch = aiResponse.match(/Department:[\s]*([^\n]+)/i);
              if (deptMatch && deptMatch[1]) department = deptMatch[1].trim();
            }

            if (aiResponse.includes("Category:")) {
              const catMatch = aiResponse.match(/Category:[\s]*([^\n]+)/i);
              if (catMatch && catMatch[1]) category = catMatch[1].trim();
            }
          }

          // Save determination to database
          try {
            await fetch(
              `https://jansamadhan-json-server.onrender.com/desiredDepartment`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  id: Date.now().toString(),
                  title: initialData.title?.substring(0, 100),
                  details: initialData.details?.substring(0, 200),
                  hasImage: Boolean(initialData.photo),
                  department,
                  category,
                  additionalInfo: answers,
                  timestamp: new Date().toISOString(),
                }),
              }
            );
          } catch (e) {
            console.error("Error saving questionnaire result:", e);
          }

          // Return the results
          onResults({
            department,
            category,
            answers,
          });
        } else {
          // If API call fails, use a simple matching approach
          const results = determineBasedOnKeywords();
          onResults(results);
        }
      } else {
        // If no API key, use a simple matching approach
        const results = determineBasedOnKeywords();
        onResults(results);
      }
    } catch (error) {
      console.error("Error processing additional information:", error);
      // Fallback
      const results = determineBasedOnKeywords();
      onResults(results);
    } finally {
      setIsProcessing(false);
    }
  };

  // Simple fallback method to determine department from answers
  const determineBasedOnKeywords = () => {
    const allText = Object.values(answers).join(" ").toLowerCase();

    if (
      allText.includes("water") ||
      allText.includes("pipe") ||
      allText.includes("leak")
    ) {
      return { department: "Water Dept", category: "Water" };
    } else if (
      allText.includes("power") ||
      allText.includes("electric") ||
      allText.includes("light")
    ) {
      return { department: "Electricity Dept", category: "Electricity" };
    } else if (
      allText.includes("road") ||
      allText.includes("street") ||
      allText.includes("pothole")
    ) {
      return { department: "Municipal Works", category: "Roads" };
    } else if (
      allText.includes("garbage") ||
      allText.includes("waste") ||
      allText.includes("trash")
    ) {
      return { department: "Sanitation Dept", category: "Sanitation" };
    } else {
      return { department: "General Admin", category: "Other" };
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl mx-4">
        {/* Header */}
        <div className="bg-blue-800 text-white p-4 flex justify-between items-center">
          <div className="flex items-center">
            <Bot className="mr-3" size={24} />
            <div>
              <h2 className="text-xl font-bold">
                Additional Information Needed
              </h2>
              <p className="text-blue-200 text-sm">
                Please answer these questions to help us assign your complaint
                correctly
              </p>
            </div>
          </div>
          <button onClick={onCancel} className="text-white hover:text-gray-200">
            <X size={24} />
          </button>
        </div>

        {/* Questions */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <div className="space-y-6">
            {questions.map((question) => (
              <div key={question.id} className="border-b pb-4">
                <h3 className="font-medium text-gray-800 mb-2">
                  {question.text}
                </h3>
                <textarea
                  value={answers[question.id] || ""}
                  onChange={(e) =>
                    handleAnswerChange(question.id, e.target.value)
                  }
                  placeholder="Type your answer here..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center ${
              isProcessing ? "opacity-75 cursor-not-allowed" : ""
            }`}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              "Submit Answers"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SmartQuestionnaire;
