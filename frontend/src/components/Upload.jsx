import React, { useState, useRef } from 'react';
import { uploadLegacyCertificate, uploadDigitalCertificate } from '../services/api';

const MAX_FILE_SIZE_MB = 10;

const Upload = () => {
  const [activeTab, setActiveTab] = useState('legacy');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef();

  // Validate file before upload
  const validateFile = (file) => {
    if (!file) return 'No file selected.';
    const allowedTypes = activeTab === 'legacy'
      ? ['application/pdf']
      : ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      return `Invalid file type. Allowed: ${allowedTypes.map(t => t.split('/')[1].toUpperCase()).join(', ')}`;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      return `File too large (max ${MAX_FILE_SIZE_MB}MB).`;
    }
    return null;
  };

  // Handle file input change
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    const validationError = validateFile(selected);
    if (validationError) {
      setError(validationError);
      setFile(null);
    } else {
      setFile(selected);
      setError(null);
      setResult(null);
    }
  };

  // Drag-and-drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const dropped = e.dataTransfer.files[0];
    const validationError = validateFile(dropped);
    if (validationError) {
      setError(validationError);
      setFile(null);
    } else {
      setFile(dropped);
      setError(null);
      setResult(null);
    }
  };

  // Handle upload
  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      let response;
      if (activeTab === 'legacy') {
        response = await uploadLegacyCertificate(file);
      } else {
        response = await uploadDigitalCertificate(file);
      }
      setResult(response.data);
      setFile(null); // Reset file after success
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  // Helper to trigger file input
  const triggerFileInput = () => fileInputRef.current && fileInputRef.current.click();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-blue-700 mb-2 tracking-tight drop-shadow">Upload Certificate</h1>
          <p className="text-gray-500 text-lg">OCR & QR-powered digital and legacy certificate upload</p>
        </div>

        <div className="bg-white rounded-lg shadow-md">
          <div className="flex border-b">
            <button
              className={`px-6 py-4 font-medium ${
                activeTab === 'legacy'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('legacy')}
            >
              Legacy Certificate
            </button>
            <button
              className={`px-6 py-4 font-medium ${
                activeTab === 'digital'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('digital')}
            >
              Digital Certificate
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'legacy' ? (
              <div>
                <h2 className="text-xl font-semibold mb-4">Legacy Certificate Upload</h2>
                <p className="text-gray-600 mb-4">
                  Upload PDF certificates for OCR text extraction
                </p>
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-semibold mb-4">Digital Certificate Upload</h2>
                <p className="text-gray-600 mb-4">
                  Upload certificates to generate QR codes for verification
                </p>
              </div>
            )}

            {/* Drag-and-drop area or file preview */}
            {!file ? (
              <div
                className={`relative border-2 border-dashed rounded-xl mb-4 p-8 flex flex-col items-center justify-center transition-colors duration-200 ${dragActive ? 'border-blue-600 bg-blue-50' : 'border-gray-300 bg-gray-50'}`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={triggerFileInput}
                style={{ cursor: 'pointer' }}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept={activeTab === 'legacy' ? '.pdf' : 'image/*,.pdf'}
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                  tabIndex={-1}
                />
                <div className="flex flex-col items-center pointer-events-none">
                  <div className="mb-2 animate-bounce-slow">
                    <svg className="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 16v2a2 2 0 002 2h6a2 2 0 002-2v-2M12 12v6m0 0l-4-4m4 4l4-4M12 4v8" /></svg>
                  </div>
                  <span className="text-blue-600 font-semibold">Drag & drop or click to select a file</span>
                  <span className="text-gray-400 text-xs mt-1">{activeTab === 'legacy' ? 'PDF only' : 'PDF, JPG, PNG'} (max {MAX_FILE_SIZE_MB}MB)</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4 mt-4 bg-white rounded-lg shadow p-3 border border-blue-100">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-5-5.917V4a2 2 0 10-4 0v1.083A6 6 0 004 11v3.159c0 .538-.214 1.055-.595 1.436L2 17h5m8 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                <div className="flex-1">
                  <span className="block font-medium text-gray-800">{file.name}</span>
                  <span className="block text-xs text-gray-400">{file.type.toUpperCase()} &bull; {(file.size/1024/1024).toFixed(2)} MB</span>
                </div>
                <button onClick={e => {e.stopPropagation(); setFile(null);}} className="ml-2 text-red-400 hover:text-red-600 transition">Remove</button>
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={loading || !file}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                'Upload Certificate'
              )}
            </button>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {result && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">Upload Successful!</h3>
                {result.qr_code_url && (
                  <div>
                    <p className="text-green-600 mb-2">QR Code generated successfully</p>
                    <img src={result.qr_code_url} alt="QR Code" className="w-32 h-32" />
                  </div>
                )}
                {result.extracted_text && (
                  <div>
                    <p className="text-green-600 mb-2">Text extracted successfully</p>
                    <pre className="bg-white p-2 rounded text-sm">{result.extracted_text.substring(0, 200)}...</pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;