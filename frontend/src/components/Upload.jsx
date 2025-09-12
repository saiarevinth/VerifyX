import React, { useState } from 'react';
import { uploadLegacyCertificate, uploadDigitalCertificate } from '../services/api';

const Upload = () => {
  const [activeTab, setActiveTab] = useState('legacy');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResult(null);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file');
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
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Upload Certificate
        </h1>

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

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 mb-4">
              <input
                type="file"
                accept={activeTab === 'legacy' ? '.pdf' : 'image/*,.pdf'}
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

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