// Background Report Analysis Service
import axios from 'axios';
import { reportNotifications } from '../utils/reportNotifications';

const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;


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
      const response = await fetch(`https://jansamadhan-json-server.onrender.com/createDepartment`);
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

  // Store allocation in specified format with better duplicate prevention
  static async storeAllocation(reportData, allocation, questionaryPayload = null) {
    try {
      // Use reportData.id as the allocation ID to prevent duplicates
      const allocationPayload = {
        id: reportData.id || Date.now().toString(),
        title: reportData.title,
        details: reportData.details,
        hasImage: !!(reportData.photo || reportData.capturedImage),
        department: allocation.departmentName,
        category: allocation.category,
        priority: allocation.priority,
        confidence: allocation.confidence,
        staffId: allocation.staffId,
        analysis: allocation.summary,
        timestamp: new Date().toISOString(),
        createdAt: reportData.createdAt || new Date().toISOString(),
        // Include the questionnaire data in the allocation payload
        questionnaire: questionaryPayload,
        photo: reportData.photo || null,
        capturedImage: reportData.capturedImage || null,
        // Add user info for better tracking
        userInfo: reportData.userInfo || {},
      };

      // Check if allocation already exists to prevent duplicates
      const existingResponse = await fetch(`https://jansamadhan-json-server.onrender.com/allocatedDepartment`);
      const existingAllocations = await existingResponse.json();
      
      // More comprehensive duplicate checking
      const existingAllocation = existingAllocations.find(a => {
        // Primary check by ID
        if (a.id === allocationPayload.id) return true;
        
        // Secondary check by title and user info to catch different ID same report
        if (a.title === allocationPayload.title && 
            a.userInfo?.email === allocationPayload.userInfo?.email &&
            Math.abs(new Date(a.createdAt || a.timestamp) - new Date(allocationPayload.createdAt)) < 60000) {
          return true; // Same report within 1 minute
        }
        
        return false;
      });

      if (existingAllocation) {
        // Update existing allocation instead of creating new one
        const updatePayload = { ...allocationPayload, id: existingAllocation.id };
        await fetch(`https://jansamadhan-json-server.onrender.com/allocatedDepartment/${existingAllocation.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatePayload),
        });
        console.log(`Allocation updated for report: ${reportData.title} (prevented duplicate)`);
      } else {
        // Create new allocation
        await fetch(`https://jansamadhan-json-server.onrender.com/allocatedDepartment`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(allocationPayload),
        });
        console.log(`Allocation stored for report: ${reportData.title}`);
      }

      return { success: true, allocationPayload };
    } catch (error) {
      console.error("Error storing allocation:", error);
      return { success: false, error: error.message };
    }
  }

  // Main analysis function - Improved workflow to prevent confusion
  static async analyzeReport(reportId, reportData) {
    try {
      console.log(`Starting background analysis for report ${reportId}`);
      
      // Prevent multiple simultaneous analyses of the same report
      const analysisKey = `analysis_${reportId}`;
      if (this.activeAnalyses?.has(analysisKey)) {
        console.log(`Analysis already in progress for report ${reportId}`);
        return { success: false, error: "Analysis already in progress" };
      }
      
      // Track active analysis
      if (!this.activeAnalyses) this.activeAnalyses = new Set();
      this.activeAnalyses.add(analysisKey);

      try {
        // Step 1: Assess if questions are needed first
        const contextAssessment = await this.assessContextClarity(
          reportData.title, 
          reportData.details
        );

        console.log(`AI Assessment completed: needsQuestions = ${contextAssessment.needsQuestions}`);

        if (!contextAssessment.needsQuestions) {
          // Step 2A: No questions needed - proceed with allocation immediately
          console.log(`No questions needed, proceeding with department allocation...`);
          
          const allocation = await this.allocateDepartmentAndStaff(
            reportData.title,
            reportData.details,
            {}
          );

          // Store allocation immediately
          await this.storeAllocation(reportData, allocation, null);

          // Update report with complete analysis - mark as ready
          const updateData = {
            category: allocation.category,
            department: allocation.departmentName,
            priority: allocation.priority,
            assignedTo: allocation.staffId,
            status: "Submitted", // Keep status as submitted but mark analysis complete
            aiAnalysis: {
              contextAssessment,
              questions: [],
              answers: {},
              departmentAllocation: allocation,
              processed: true,
              needsQuestions: false,
              questionsCompleted: true,
              analysisCompleted: true
            },
            needsAnalysis: false,
            updatedAt: new Date().toISOString()
          };

          await fetch(`https://jansamadhan-json-server.onrender.com/complaints/${reportId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updateData)
          });

          console.log(`Background analysis completed for report ${reportId} - No questions needed`);
          return { success: true, needsQuestions: false, allocation };

        } else {
          // Step 2B: Questions are needed - DON'T allocate department yet, but prepare for questions
          console.log(`Questions needed, preparing questionnaire for user...`);
          
          const updateData = {
            status: "Pending Additional Info", // Change status to indicate questions needed
            aiAnalysis: {
              contextAssessment,
              questions: contextAssessment.questions || [],
              answers: {},
              processed: true,
              needsQuestions: true,
              questionsCompleted: false,
              analysisCompleted: false // Analysis not complete until questions answered
            },
            needsAnalysis: false,
            updatedAt: new Date().toISOString()
          };

          await fetch(`https://jansamadhan-json-server.onrender.com/complaints/${reportId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updateData)
          });

          // Send notification for questions AFTER updating status
          await reportNotifications.notifyQuestionsNeeded(
            reportId,
            reportData.title,
            contextAssessment.questions.length
          );

          console.log(`Background analysis completed for report ${reportId} - Questions required`);
          return { success: true, needsQuestions: true, questions: contextAssessment.questions };
        }
        
      } finally {
        // Clean up active analysis tracking
        this.activeAnalyses.delete(analysisKey);
      }
      
    } catch (error) {
      console.error(`Background analysis failed for report ${reportId}:`, error);
      
      // Clean up on error
      if (this.activeAnalyses) {
        this.activeAnalyses.delete(`analysis_${reportId}`);
      }
      
      // Update report with error status
      await fetch(`https://jansamadhan-json-server.onrender.com/complaints/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Analysis Failed",
          needsAnalysis: false,
          aiAnalysis: {
            processed: true,
            error: error.message,
            needsQuestions: false,
            analysisCompleted: false
          },
          updatedAt: new Date().toISOString()
        })
      });

      return { success: false, error: error.message };
    }
  }

  // Update report with question answers and complete allocation
  static async updateReportWithAnswers(reportId, answers) {
    try {
      console.log(`Processing question answers for report ${reportId}`);
      
      // Get current report
      const reportResponse = await fetch(`https://jansamadhan-json-server.onrender.com/complaints/${reportId}`);
      const report = await reportResponse.json();

      // Re-analyze with answers to determine final allocation
      const allocation = await this.allocateDepartmentAndStaff(
        report.title,
        report.details,
        answers
      );

      console.log(`Final allocation determined:`, allocation);

      // Store allocation after questions are answered
      await this.storeAllocation(report, allocation, answers);

      // Update the report with complete analysis and proper status
      const updateData = {
        category: allocation.category,
        department: allocation.departmentName,
        priority: allocation.priority,
        assignedTo: allocation.staffId,
        status: "Submitted", // Return to submitted status now that analysis is complete
        aiAnalysis: {
          ...report.aiAnalysis,
          answers,
          departmentAllocation: allocation,
          questionsCompleted: true,
          analysisCompleted: true // Mark analysis as fully complete
        },
        updatedAt: new Date().toISOString()
      };

      await fetch(`https://jansamadhan-json-server.onrender.com/complaints/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData)
      });

      console.log(`Report ${reportId} updated with final allocation after questions completed`);
      return { success: true, allocation };
    } catch (error) {
      console.error("Error updating report with answers:", error);
      return { success: false, error: error.message };
    }
  }
}

// Export singleton instance
export const backgroundAnalysis = new BackgroundAnalysisService();
