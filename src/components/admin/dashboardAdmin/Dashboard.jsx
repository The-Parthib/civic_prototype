import React, { useState } from "react";

const Dashboard = ({ complaints }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  const openModal = (imageSrc) => {
    setSelectedImage(imageSrc);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
        <p className="text-blue-800">
          Welcome to the Jharkhand Government Admin Dashboard. Manage your
          government services and applications here.
        </p>
      </div>

      {/* Complaints Section */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">
          Complaints in your area
        </h2>
        {complaints.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-yellow-800">
            No complaints found for your district and pincode.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {complaints.map((c, idx) => (
              <div
                key={c.id || idx}
                className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow flex flex-col"
              >
                {c.photo && (
                  <div className="cursor-pointer mb-3" onClick={() => openModal(c.photo)}>
                    <img
                      src={c.photo}
                      alt="Complaint"
                      className="rounded-md border border-gray-300 w-full h-48 object-cover transition-transform duration-200 hover:scale-105"
                    />
                    <div className="text-xs text-gray-500 mt-1 text-center">Click to enlarge</div>
                  </div>
                )}
                <div className="mb-2">
                  <span className="font-semibold text-gray-700">Title:</span>{" "}
                  <span className="text-gray-800">{c.title}</span>
                </div>
                <div className="mb-2">
                  <span className="font-semibold text-gray-700">Details:</span>{" "}
                  <span className="text-gray-800">{c.details}</span>
                </div>
                <div className="mb-2">
                  <span className="font-semibold text-gray-700">Category:</span>{" "}
                  <span className="text-gray-800">{c.category}</span>
                </div>
                <div className="mb-2">
                  <span className="font-semibold text-gray-700">
                    Department:
                  </span>{" "}
                  <span className="text-gray-800">{c.department}</span>
                </div>
                <div className="mb-2">
                  <span className="font-semibold text-gray-700">Status:</span>{" "}
                  <span
                    className={`font-medium ${
                      c.status === "Resolved"
                        ? "text-green-600"
                        : c.status === "In Progress"
                        ? "text-blue-600"
                        : "text-orange-600"
                    }`}
                  >
                    {c.status}
                  </span>
                </div>
                <div className="mb-2">
                  <span className="font-semibold text-gray-700">
                    Submitted:
                  </span>{" "}
                  <span className="text-gray-800">
                    {c.createdAt ? new Date(c.createdAt).toLocaleString() : ""}
                  </span>
                </div>
                {c.location && (
                  <div className="mb-2">
                    <span className="font-semibold text-gray-700">
                      Location:
                    </span>{" "}
                    <span className="text-gray-800">
                      {c.location.address}, {c.location.municipality}
                    </span>
                  </div>
                )}
                {c.userInfo && (
                  <div className="mb-2">
                    <span className="font-semibold text-gray-700">User:</span>{" "}
                    <span className="text-gray-800">{c.userInfo.name}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-transparent bg-opacity-70 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              className="absolute -top-10 right-0 text-white text-3xl hover:text-gray-300 transition-colors"
              onClick={closeModal}
            >
              &times;
            </button>
            <img
              src={selectedImage}
              alt="Enlarged complaint"
              className="max-w-full max-h-screen object-contain rounded-lg shadow-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;