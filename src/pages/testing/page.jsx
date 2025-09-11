import React, { useState } from 'react';
import { Camera } from 'lucide-react';function CameraTesting() {
  const [source, setSource] = useState("");

  const handleCapture = (target) => {
    if (target.files) {
      if (target.files.length !== 0) {
        const file = target.files[0];
        const newUrl = URL.createObjectURL(file);
        setSource(newUrl);
      }
    }
  };

  return (
    <div className="h-full text-center">
      <div className="flex flex-col items-center">
        <div className="w-full">
          <h5>Capture your image</h5>
          {source && (
            <div className="flex justify-center border border-gray-300 max-w-4/5 max-h-4/5 m-2.5 mx-auto">
              <img src={source} alt="snap" className="h-full max-w-full" />
            </div>
          )}
          <input
            accept="image/*"
            className="hidden"
            id="icon-button-file"
            type="file"
            capture="environment"
            onChange={(e) => handleCapture(e.target)}
          />
          <label htmlFor="icon-button-file">
            <button
              className="text-blue-500 hover:text-blue-700 p-2 rounded"
              aria-label="upload picture"
            >
              <Camera size={32} />
            </button>
          </label>
        </div>
      </div>
    </div>
  );
}
export default CameraTesting;