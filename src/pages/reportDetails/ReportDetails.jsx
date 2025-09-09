import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Bell, Clock, MapPin, User, FileText, Camera, ArrowLeft, CheckCircle, RefreshCw } from 'lucide-react';
import { reportNotifications } from '../../utils/reportNotifications';
import { BackgroundAnalysisService } from '../../services/backgroundAnalysis';
import BottomNavigation from '../../components/BottomNavigation';

const ReportDetails = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const port = import.meta.env.VITE_DB_PORT || 5000;

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [questions, setQuestions] = useState([]);
  const [questionAnswers, setQuestionAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showQuestions, setShowQuestions] = useState(false);
  const [isSubmittingAnswers, setIsSubmittingAnswers] = useState(false);
  const [questionsCompleted, setQuestionsCompleted] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Function to request notification permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  // Trigger background analysis if needed
  const triggerAnalysisIfNeeded = async (reportData) => {
    if (reportData.needsAnalysis) {
      setIsAnalyzing(true);
      
      // Start background analysis directly
      try {
        setTimeout(async () => {
          const result = await BackgroundAnalysisService.analyzeReport(reportId, reportData);
          if (result.success && result.needsQuestions) {
            // Refresh the report to get updated questions
            const response = await fetch(`http://localhost:${port}/complaints/${reportId}`);
            const updatedReport = await response.json();
            setReport(updatedReport);
            
            if (updatedReport.aiAnalysis?.questions?.length > 0) {
              setQuestions(updatedReport.aiAnalysis.questions);
              setShowQuestions(true);
            }
          }
          setIsAnalyzing(false);
        }, 2000);
        
      } catch (error) {
        console.error('Failed to trigger analysis:', error);
        setIsAnalyzing(false);
      }
    } else if (reportData.aiAnalysis?.processed) {
      // Analysis already completed
      if (reportData.aiAnalysis.needsQuestions && reportData.aiAnalysis.questions?.length > 0) {
        setQuestions(reportData.aiAnalysis.questions);
        if (!reportData.aiAnalysis.questionsCompleted) {
          setShowQuestions(true);
        } else {
          setQuestionsCompleted(true);
        }
      }
    }
  };

  // Fetch report details
  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await fetch(`http://localhost:${port}/complaints/${reportId}`);
        if (!response.ok) throw new Error('Report not found');
        
        const reportData = await response.json();
        setReport(reportData);
        
        // Request notification permission
        await requestNotificationPermission();
        
        // Check if analysis is needed or already completed
        triggerAnalysisIfNeeded(reportData);
        
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (reportId) {
      fetchReport();
    }
  }, [reportId]);

  // Handle question answers
  const handleAnswerQuestion = (answer) => {
    setQuestionAnswers(prev => ({
      ...prev,
      [questions[currentQuestionIndex]]: answer
    }));

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      submitAnswers();
    }
  };

  // Submit answers
  const submitAnswers = async () => {
    setIsSubmittingAnswers(true);
    try {
      // Update the report with answers using the background service
      const result = await BackgroundAnalysisService.updateReportWithAnswers(
        reportId, 
        questionAnswers
      );

      if (result.success) {
        setQuestionsCompleted(true);
        setShowQuestions(false);
        
        // Refresh report data
        const response = await fetch(`http://localhost:${port}/complaints/${reportId}`);
        const updatedReport = await response.json();
        setReport(updatedReport);
        
        // Send completion notification
        await reportNotifications.notifyQuestionsCompleted(
          reportId,
          report.title
        );
      }
    } catch (error) {
      console.error('Error submitting answers:', error);
    } finally {
      setIsSubmittingAnswers(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading report details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/home')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/home')}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <ArrowLeft size={20} />
              </button>
              <h1 className="text-xl font-bold text-gray-900">Report Details</h1>
            </div>
            <div className="flex items-center space-x-2">
              {isAnalyzing && (
                <div className="flex items-center space-x-2 text-blue-600">
                  <RefreshCw className="animate-spin" size={16} />
                  <span className="text-sm">Analyzing report...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Questions Section */}
        {showQuestions && questions.length > 0 && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Bell className="text-amber-600 mt-1 flex-shrink-0" size={20} />
              <div className="flex-1">
                <h3 className="font-semibold text-amber-800 mb-2">
                  Additional Information Needed
                </h3>
                <p className="text-sm text-amber-700 mb-4">
                  To better process your report, please answer the following questions:
                </p>
                
                <div className="bg-white rounded-lg p-4 border">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">
                      Question {currentQuestionIndex + 1} of {questions.length}
                    </span>
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {currentQuestionIndex === questions.length - 1 ? 'Last question' : 'Required'}
                    </span>
                  </div>
                  
                  <p className="text-gray-800 mb-4">
                    {questions[currentQuestionIndex]}
                  </p>
                  
                  <textarea
                    className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Type your answer here..."
                    value={questionAnswers[questions[currentQuestionIndex]] || ''}
                    onChange={(e) => {
                      setQuestionAnswers(prev => ({
                        ...prev,
                        [questions[currentQuestionIndex]]: e.target.value
                      }));
                    }}
                  />
                  
                  <div className="flex justify-between mt-4">
                    <button
                      onClick={() => setShowQuestions(false)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg"
                    >
                      Skip for Now
                    </button>
                    <button
                      onClick={() => handleAnswerQuestion(questionAnswers[questions[currentQuestionIndex]] || '')}
                      disabled={isSubmittingAnswers}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isSubmittingAnswers ? 'Submitting...' : 
                       currentQuestionIndex === questions.length - 1 ? 'Submit Answers' : 'Next Question'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Questions Completed Banner */}
        {questionsCompleted && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="text-green-600" size={20} />
              <div>
                <h3 className="font-semibold text-green-800">Questions Completed!</h3>
                <p className="text-sm text-green-700">
                  Thank you for providing additional information. This will help us process your report more efficiently.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Report Details Card */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {/* Status Header */}
          <div className="bg-gray-50 px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  report.status === 'Submitted' ? 'bg-yellow-100 text-yellow-800' :
                  report.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                  report.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {report.status}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  report.priority === 'high' ? 'bg-red-100 text-red-800' :
                  report.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {report.priority || 'Medium'} Priority
                </span>
              </div>
              <div className="text-sm text-gray-500">
                Report #{report.id}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                  {report.title}
                </h1>
                
                <div className="prose max-w-none mb-6">
                  <p className="text-gray-700 leading-relaxed">
                    {report.details}
                  </p>
                </div>

                {/* Image */}
                {(report.photo || report.capturedImage) && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <Camera className="mr-2" size={20} />
                      Attached Photo
                    </h3>
                    <img
                      src={report.photo || report.capturedImage}
                      alt="Report evidence"
                      className="w-full max-w-md rounded-lg border shadow-sm"
                    />
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Report Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Report Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-2">
                      <FileText className="text-gray-400 mt-1" size={16} />
                      <div>
                        <p className="text-sm text-gray-500">Category</p>
                        <p className="font-medium">{report.category}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <User className="text-gray-400 mt-1" size={16} />
                      <div>
                        <p className="text-sm text-gray-500">Department</p>
                        <p className="font-medium">{report.department}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Clock className="text-gray-400 mt-1" size={16} />
                      <div>
                        <p className="text-sm text-gray-500">Submitted</p>
                        <p className="font-medium">
                          {new Date(report.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Location Info */}
                {report.location && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <MapPin className="mr-2" size={16} />
                      Location
                    </h3>
                    <div className="text-sm text-gray-700">
                      <p>{report.location.address}</p>
                      {report.location.municipality && (
                        <p>{report.location.municipality}</p>
                      )}
                      <p>{report.location.pincode}</p>
                    </div>
                  </div>
                )}

                {/* Contact Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Contact Information</h3>
                  <div className="text-sm text-gray-700 space-y-1">
                    <p><span className="font-medium">Name:</span> {report.userInfo?.name}</p>
                    <p><span className="font-medium">Email:</span> {report.userInfo?.email}</p>
                    {report.userInfo?.phone && (
                      <p><span className="font-medium">Phone:</span> {report.userInfo.phone}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default ReportDetails;
