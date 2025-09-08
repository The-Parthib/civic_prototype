import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, MapPin, Camera, Filter, Search } from 'lucide-react';
import BottomNavigation from '../../components/BottomNavigation';

const PostsScreen = () => {
  const navigate = useNavigate();
  const port = import.meta.env.VITE_DB_PORT || 5000;
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost';
  
  const [activeTab, setActiveTab] = useState('my-posts');
  const [myPosts, setMyPosts] = useState([]);
  const [areaPosts, setAreaPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = sessionStorage.getItem("civicName");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      fetchMyPosts(userData.email);
      fetchAreaPosts(userData.municipality);
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const fetchMyPosts = async (email) => {
    try {
      const response = await fetch(
        `${apiBaseUrl}:${port}/complaints?userInfo.email=${encodeURIComponent(email)}`
      );
      if (response.ok) {
        const data = await response.json();
        setMyPosts(Array.isArray(data) ? data.reverse() : []); // Most recent first
      }
    } catch (error) {
      console.error('Error fetching my posts:', error);
    }
  };

  const fetchAreaPosts = async (municipality) => {
    try {
      const response = await fetch(
        `${apiBaseUrl}:${port}/complaints?userInfo.municipality=${encodeURIComponent(municipality)}`
      );
      if (response.ok) {
        const data = await response.json();
        setAreaPosts(Array.isArray(data) ? data.reverse() : []); // Most recent first
      }
    } catch (error) {
      console.error('Error fetching area posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Submitted': return 'bg-yellow-100 text-yellow-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filterPosts = (posts) => {
    return posts.filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           post.details.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterStatus === 'all' || post.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  };

  const PostCard = ({ post, showUserInfo = false }) => (
    <div 
      className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => navigate(`/report/${post.id}`)}
    >
      <div className="flex items-start space-x-3">
        {(post.photo || post.capturedImage) && (
          <img
            src={post.photo || post.capturedImage}
            alt="Report"
            className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-gray-900 line-clamp-2">{post.title}</h3>
            <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
              {formatDate(post.createdAt)}
            </span>
          </div>
          
          <p className="text-sm text-gray-600 line-clamp-2 mt-1">{post.details}</p>
          
          {showUserInfo && (
            <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500">
              <span>By {post.userInfo?.name || 'Anonymous'}</span>
              {post.location?.municipality && (
                <>
                  <span>•</span>
                  <MapPin className="w-3 h-3" />
                  <span>{post.location.municipality}</span>
                </>
              )}
            </div>
          )}
          
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center space-x-2">
              <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(post.status)}`}>
                {post.status}
              </span>
              {post.priority && (
                <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(post.priority)}`}>
                  {post.priority}
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-3 text-xs text-gray-500">
              {post.category && (
                <span className="bg-gray-100 px-2 py-1 rounded">{post.category}</span>
              )}
              {post.department && (
                <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">{post.department}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const EmptyState = ({ type }) => (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Camera className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {type === 'my-posts' ? 'No Reports Yet' : 'No Area Activity'}
      </h3>
      <p className="text-gray-500 text-sm mb-4">
        {type === 'my-posts' 
          ? "You haven't created any reports yet." 
          : "No recent activity in your area."}
      </p>
      {type === 'my-posts' && (
        <button
          onClick={() => navigate('/create-post')}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
        >
          Create Your First Report
        </button>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const currentPosts = activeTab === 'my-posts' ? myPosts : areaPosts;
  const filteredPosts = filterPosts(currentPosts);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900 mb-4">Reports</h1>
          
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {/* Filter */}
          <div className="flex items-center space-x-3 mb-4">
            <Filter className="text-gray-400" size={16} />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="Submitted">Submitted</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
          
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('my-posts')}
              className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 ${
                activeTab === 'my-posts'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              My Reports ({myPosts.length})
            </button>
            <button
              onClick={() => setActiveTab('area-posts')}
              className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 ${
                activeTab === 'area-posts'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Area Reports ({areaPosts.length})
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-4">
        {filteredPosts.length === 0 ? (
          searchQuery || filterStatus !== 'all' ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No reports match your search criteria.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterStatus('all');
                }}
                className="mt-2 text-blue-600 font-medium hover:text-blue-700"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <EmptyState type={activeTab} />
          )
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <PostCard 
                key={post.id} 
                post={post} 
                showUserInfo={activeTab === 'area-posts'} 
              />
            ))}
          </div>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
};

export default PostsScreen;
