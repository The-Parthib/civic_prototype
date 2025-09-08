// Background Report Analysis Service
import axios from 'axios';
import { reportNotifications } from '../utils/reportNotifications';

const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;
const port = import.meta.env.VITE_DB_PORT || 5000;

export class BackgroundAnalysisService {
  
  // Function to call Gemini API
  static async callGeminiApi(prompt) {
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
      return JSON.parse(jsonText);
    } catch (error) {
      console.error("Error calling Gemini API:", error.response?.data || error.message);
      throw error;
    }
  }

  // Assess if the report needs clarifying questions
  static async assessContextClarity(titleText, detailsText) {
    try {
      const contextQuestions = [
        "What is the nature/type of the civic issue? (e.g., water supply, road repair, electricity, sanitation, etc.)",
        "Where is the issue located? (specific address, landmark, area, or coordinates)",
        "What is the scope of the issue? (affects individual household, building, community, or larger area)",
        "What is the urgency level of this issue? (low, medium, high priority or emergency)"
      ];

      const assessmentPrompt = `
        You are assessing whether a civic complaint report needs additional clarifying questions.

        Report Title: "${titleText || ''}"
        Report Details: "${detailsText || ''}"

        Municipal Context Questions that need to be answered:
        ${contextQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

        Based on the provided information, determine if additional questions are needed and generate specific questions.

        Return your response as a JSON object with this exact structure:
        {
          "needsQuestions": boolean,
          "confidence": "low" | "medium" | "high",
          "questions": string[],
          "reasoning": "Brief explanation",
          "missingContext": string[]
        }

        Set "needsQuestions" to true if important context is missing. Generate 2-4 specific questions if needed.
      `;

      const assessment = await this.callGeminiApi(assessmentPrompt);
      return assessment;
    } catch (error) {
      console.error("Error assessing context clarity:", error);
      return {
        needsQuestions: false,
        confidence: "low",
        questions: [],
        reasoning: "Assessment failed",
        missingContext: []
      };
    }
  }

  // Get municipal structure
  static async fetchMunicipalStructure() {
    try {
      const response = await fetch(`http://localhost:${port}/createDepartment`);
      if (!response.ok) throw new Error("Failed to fetch departments");

      const departments = await response.json();
      return {
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
    } catch (error) {
      console.error("Error fetching municipal structure:", error);
      return null;
    }
  }

  // Allocate department and staff
  static async allocateDepartmentAndStaff(title, details, answers = {}) {
    try {
      const structure = await this.fetchMunicipalStructure();
      if (!structure) throw new Error("Could not fetch municipal structure");

      const categories = ["Roads", "Water", "Electricity", "Sanitation", "Other"];
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

      const allocation = await this.callGeminiApi(classificationPrompt);
      return allocation;
    } catch (error) {
      console.error("Error allocating department:", error);
      return {
        departmentName: "General Admin",
        staffId: null,
        category: "Other",
        priority: "medium",
        confidence: "low",
        summary: "Unable to classify automatically"
      };
    }
  }

  // Main analysis function
  static async analyzeReport(reportId, reportData) {
    try {
      console.log(`Starting background analysis for report ${reportId}`);
      
      // Step 1: Assess if questions are needed
      const contextAssessment = await this.assessContextClarity(
        reportData.title, 
        reportData.details
      );

      // Step 2: Allocate department (basic allocation first)
      const allocation = await this.allocateDepartmentAndStaff(
        reportData.title,
        reportData.details,
        {}
      );

      // Step 3: Update the report with initial analysis
      const updateData = {
        category: allocation.category,
        department: allocation.departmentName,
        priority: allocation.priority,
        assignedTo: allocation.staffId,
        aiAnalysis: {
          contextAssessment,
          questions: contextAssessment.questions || [],
          answers: {},
          departmentAllocation: allocation,
          processed: true,
          needsQuestions: contextAssessment.needsQuestions
        },
        needsAnalysis: false,
        updatedAt: new Date().toISOString()
      };

      // Update the report in the database
      await fetch(`http://localhost:${port}/complaints/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData)
      });

      // Step 4: Send notification if questions are needed
      if (contextAssessment.needsQuestions && contextAssessment.questions.length > 0) {
        await reportNotifications.notifyQuestionsNeeded(
          reportId,
          reportData.title,
          contextAssessment.questions.length
        );
      }

      console.log(`Background analysis completed for report ${reportId}`);
      return { success: true, needsQuestions: contextAssessment.needsQuestions };
      
    } catch (error) {
      console.error(`Background analysis failed for report ${reportId}:`, error);
      
      // Update report with error status
      await fetch(`http://localhost:${port}/complaints/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          needsAnalysis: false,
          aiAnalysis: {
            processed: true,
            error: error.message,
            needsQuestions: false
          },
          updatedAt: new Date().toISOString()
        })
      });

      return { success: false, error: error.message };
    }
  }

  // Update report with question answers
  static async updateReportWithAnswers(reportId, answers) {
    try {
      // Get current report
      const reportResponse = await fetch(`http://localhost:${port}/complaints/${reportId}`);
      const report = await reportResponse.json();

      // Re-analyze with answers
      const allocation = await this.allocateDepartmentAndStaff(
        report.title,
        report.details,
        answers
      );

      // Update the report
      const updateData = {
        category: allocation.category,
        department: allocation.departmentName,
        priority: allocation.priority,
        assignedTo: allocation.staffId,
        aiAnalysis: {
          ...report.aiAnalysis,
          answers,
          departmentAllocation: allocation,
          questionsCompleted: true
        },
        updatedAt: new Date().toISOString()
      };

      await fetch(`http://localhost:${port}/complaints/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData)
      });

      return { success: true, allocation };
    } catch (error) {
      console.error("Error updating report with answers:", error);
      return { success: false, error: error.message };
    }
  }
}

// Export singleton instance
export const backgroundAnalysis = new BackgroundAnalysisService();
