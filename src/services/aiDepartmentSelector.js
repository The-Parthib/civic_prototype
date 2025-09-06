/**
 * AI Department Selector Service
 * Uses Gemini 2.5 Pro to analyze complaint text and images
 * to determine the appropriate department and category
 */

const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
const port = import.meta.env.VITE_DB_PORT || 5000;

/**
 * Determine department and category using Gemini API
 * @param {string} complaintText - The text description of the complaint
 * @param {string} imageBase64 - Optional base64 encoded image
 * @param {Array} departmentsRef - Reference data for departments
 * @returns {Promise<Object>} - Department selection results
 */
export const determineDepartment = async (
  complaintText,
  imageBase64,
  departmentsRef
) => {
  try {
    // Check if API key is available
    if (!geminiApiKey) {
      console.warn(
        "Gemini API key not found, falling back to keyword matching"
      );
      return performKeywordMatching(complaintText, departmentsRef);
    }

    // Prepare system prompt with department information
    const systemPrompt = `
You are a civic issue classifier for a smart city complaint system. Your task is to analyze user complaints and determine which municipal department should handle them.

Available departments:
${departmentsRef
  .map(
    (dept) =>
      `- ${dept.name} (Category: ${
        dept.category
      }): handles issues related to ${dept.keywords.join(", ")}. 
   Urgent keywords: ${dept.urgencyKeywords.join(", ")}`
  )
  .join("\n")}

Based on the complaint description and any image provided, determine:
1. The most appropriate department to handle this issue
2. The relevant category from: Roads, Water, Electricity, Sanitation, Other
3. Priority level (high, medium, low)
4. Your confidence level (high, medium, low)

If you cannot determine the appropriate department with at least medium confidence, respond with a set of clarifying questions instead.`;

    // Prepare parts array
    const parts = [
      { text: systemPrompt },
      { text: `Problem Details: ${complaintText}` },
    ];

    // Add image if provided
    if (imageBase64 && imageBase64.includes("base64")) {
      // Extract the base64 data without the prefix
      const base64Data = imageBase64.split(",")[1] || imageBase64;
      parts.push({
        inline_data: {
          mime_type: "image/jpeg",
          data: base64Data,
        },
      });
    }

    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: parts,
            },
          ],
          generation_config: {
            temperature: 0.2,
            top_p: 0.8,
            top_k: 40,
            max_output_tokens: 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiResponseText) {
      throw new Error("Empty response from Gemini API");
    }

    // Process the AI response
    if (
      aiResponseText.includes("Questions:") ||
      aiResponseText.includes("clarifying questions") ||
      aiResponseText.toLowerCase().includes("need more information")
    ) {
      // AI needs more information - return questions
      return {
        needsMoreInfo: true,
        questions: extractQuestions(aiResponseText),
        originalResponse: aiResponseText,
      };
    } else {
      // AI has determined a department
      const departmentInfo = extractDepartmentInfo(
        aiResponseText,
        departmentsRef
      );

      // Save determination to the database
      await saveDetermination(complaintText, imageBase64, departmentInfo);

      return {
        ...departmentInfo,
        needsMoreInfo: false,
        originalResponse: aiResponseText,
      };
    }
  } catch (error) {
    console.error("Error in AI department determination:", error);
    // Fall back to keyword matching if AI fails
    return performKeywordMatching(complaintText, departmentsRef);
  }
};

/**
 * Extract structured department information from AI response
 */
function extractDepartmentInfo(aiResponse, departmentsRef) {
  try {
    // Check if the response contains a JSON object
    const jsonMatch =
      aiResponse.match(/```json\n?([\s\S]*?)\n?```/) ||
      aiResponse.match(/{[\s\S]*?}/);

    if (jsonMatch) {
      // Try to parse the JSON response
      const jsonString = jsonMatch[0].replace(/```json\n?|```/g, "");
      const parsedResponse = JSON.parse(jsonString);

      return {
        department: parsedResponse.department || "General Admin",
        category: parsedResponse.category || "Other",
        priority: parsedResponse.priority || "medium",
        confidence: parsedResponse.confidence || "medium",
        analysis: parsedResponse.analysis || "Based on AI analysis",
      };
    }

    // If no valid JSON, extract information from text
    let department = "General Admin";
    let category = "Other";
    let priority = "medium";
    let confidence = "medium";

    // Extract department
    const deptMatch = aiResponse.match(/department:?\s*([A-Za-z\s]+)/i);
    if (deptMatch) department = deptMatch[1].trim();

    // Extract category
    const catMatch = aiResponse.match(/category:?\s*([A-Za-z\s]+)/i);
    if (catMatch) category = catMatch[1].trim();

    // Extract priority
    const prioMatch = aiResponse.match(/priority:?\s*([A-Za-z\s]+)/i);
    if (prioMatch) priority = prioMatch[1].trim().toLowerCase();

    // Extract confidence
    const confMatch = aiResponse.match(/confidence:?\s*([A-Za-z\s]+)/i);
    if (confMatch) confidence = confMatch[1].trim().toLowerCase();

    // Find the matching department from departmentsRef
    const matchingDept = departmentsRef.find(
      (dept) =>
        dept.name.toLowerCase().includes(department.toLowerCase()) ||
        department.toLowerCase().includes(dept.name.toLowerCase())
    );

    return {
      department: matchingDept?.name || department,
      category: matchingDept?.category || category,
      priority: priority,
      confidence: confidence,
      analysis: aiResponse,
    };
  } catch (error) {
    console.error("Error extracting department info:", error);
    return {
      department: "General Admin",
      category: "Other",
      priority: "medium",
      confidence: "low",
      analysis: "Error processing AI response",
    };
  }
}

/**
 * Extract questions from AI response
 */
function extractQuestions(aiResponse) {
  // Default questions if we can't extract them
  const defaultQuestions = [
    {
      id: "nature",
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

  try {
    // Try to extract questions from the AI response
    const questionLines = aiResponse
      .split("\n")
      .filter((line) =>
        line
          .trim()
          .match(
            /^\d+[\.\)]\s+|[-•]\s+|Questions?:|What|Where|When|How|Is|Are|Can|Could|Would|Do/i
          )
      )
      .map((line) =>
        line
          .trim()
          .replace(/^\d+[\.\)]\s+|[-•]\s+/g, "")
          .trim()
      );

    if (questionLines.length >= 3) {
      return questionLines
        .slice(0, Math.min(5, questionLines.length))
        .map((text, index) => ({
          id: `question_${index}`,
          text: text,
        }));
    }

    return defaultQuestions;
  } catch (error) {
    console.error("Error extracting questions:", error);
    return defaultQuestions;
  }
}

/**
 * Save determination to the database
 */
async function saveDetermination(complaintText, imageBase64, departmentInfo) {
  try {
    const determination = {
      id: Date.now().toString(),
      complaintText: complaintText.substring(0, 200), // Save a truncated version
      hasImage: Boolean(imageBase64),
      department: departmentInfo.department,
      category: departmentInfo.category,
      priority: departmentInfo.priority,
      confidence: departmentInfo.confidence,
      timestamp: new Date().toISOString(),
    };

    await fetch(`http://localhost:${port}/desiredDepartment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(determination),
    });

    console.log("AI determination saved to database");
  } catch (error) {
    console.error("Error saving determination to database:", error);
  }
}

/**
 * Fallback keyword-based matching
 */
function performKeywordMatching(complaintText, departmentsRef) {
  const text = complaintText.toLowerCase();

  let bestMatch = departmentsRef[4]; // Default to General Admin
  let maxScore = 0;
  let detectedPriority = "medium";

  departmentsRef.forEach((dept) => {
    // Calculate keyword score (main keywords)
    const keywordScore = dept.keywords.reduce((acc, keyword) => {
      const count = (text.match(new RegExp(keyword.toLowerCase(), "g")) || [])
        .length;
      return acc + count;
    }, 0);

    // Calculate urgency score
    const urgencyScore = dept.urgencyKeywords.reduce((acc, keyword) => {
      return acc + (text.includes(keyword.toLowerCase()) ? 2 : 0); // Higher weight for urgency
    }, 0);

    const totalScore = keywordScore + urgencyScore;

    if (totalScore > maxScore) {
      maxScore = totalScore;
      bestMatch = dept;

      // Determine priority based on urgency keywords
      if (urgencyScore > 0) {
        detectedPriority = "high";
      }
    }
  });

  // Calculate confidence
  const confidence = maxScore > 3 ? "high" : maxScore > 1 ? "medium" : "low";

  return {
    department: bestMatch.name,
    category: bestMatch.category,
    priority: detectedPriority,
    confidence: confidence,
    analysis: `Keyword-based analysis found ${maxScore} keyword matches with ${confidence} confidence.`,
    needsMoreInfo: confidence === "low",
  };
}
