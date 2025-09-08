import React, { useState } from "react";
import { Bot, X } from "lucide-react";

const AIQuestionnaire = ({ questions, onSubmit, onCancel }) => {
  const [answers, setAnswers] = useState({});

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSubmit = () => {
    onSubmit(answers);
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
                Please answer these questions to better identify your issue
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
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Submit Answers
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIQuestionnaire;
