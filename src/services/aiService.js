/**
 * Service for AI-based department detection using Google Gemini
 */

const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
const port = import.meta.env.VITE_DB_PORT || 5000;

/**
 * Analyzes complaint text and image to determine appropriate department
 *
 * @param {string} title - The complaint title
 * @param {string} details - The complaint details
 * @param {string} imageBase64 - Optional base64 encoded image
 * @param {Array} departmentsRef - Reference data for departments
 * @returns {Promise<Object>} - The determined department info
 */
export const determineDepartment = async (
  title,
  details,
  imageBase64,
  departmentsRef
) => {
  // For backwards compatibility with existing code
  // In the updated flow, we'll use Gemini API directly from Dashboard.jsx

  // Default response with low confidence to trigger the questionnaire
  return {
    department: "",
    category: "",
    priority: "medium",
    confidence: "low",
    summary: "Please provide more information about your issue.",
  };
};

/**
 * Save determination to the database
 */
const saveDetermination = async (determination) => {
  try {
    await fetch(`http://localhost:${port}/desiredDepartment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: Date.now().toString(),
        title: determination.title?.substring(0, 100),
        details: determination.details?.substring(0, 200),
        hasImage: determination.hasImage,
        department: determination.department,
        category: determination.category,
        priority: determination.priority,
        confidence: determination.confidence,
        analysis: determination.analysis,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (error) {
    console.error("Error saving AI determination:", error);
  }
};

/**
 * Fallback keyword-based matching
 */
const performKeywordMatching = (title, details, departmentsRef) => {
  const text = `${title} ${details}`.toLowerCase();

  let bestMatch = departmentsRef[4]; // Default to General Admin
  let maxScore = 0;
  let detectedPriority = "medium";

  departmentsRef.forEach((dept) => {
    // Calculate keyword score
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
    analysis: `Matched based on keywords with ${confidence} confidence.`,
  };
};

/*

1. USer mandatory input. location, image, title . description
2. gemini-> context clering question asbe 
3. gemini-> determine category | department

*/
