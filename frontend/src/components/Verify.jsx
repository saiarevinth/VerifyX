import React, { useState } from 'react';
import { verifyCertificate } from '../services/api';

const Verify = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResult(null);
    setError(null);
  };

  const handleVerify = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await verifyCertificate(file);
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'valid':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'invalid':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'suspicious':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'valid':
        return '✅';
      case 'invalid':
        return '❌';
      case 'suspicious':
        return '⚠️';
      default:
        return '❓';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-green-700 mb-2 tracking-tight drop-shadow">Verify Certificate</h1>
          <p className="text-gray-500 text-lg">Instantly check certificate authenticity using OCR & QR</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Upload Certificate for Verification</h2>
            <p className="text-gray-600 mb-4">
              Upload a certificate image or PDF to verify its authenticity against our database
            </p>
          </div>

          {/* Drag-and-drop area or file preview */}
          {!file ? (
            <div
              className={`relative border-2 border-dashed rounded-xl mb-4 p-8 flex flex-col items-center justify-center transition-colors duration-200 ${loading ? 'border-green-400 bg-green-50' : 'border-gray-300 bg-gray-50'}`}
              onDragEnter={e => {e.preventDefault();e.stopPropagation();}}
              onDragOver={e => {e.preventDefault();e.stopPropagation();}}
              onDrop={e => {
                e.preventDefault();e.stopPropagation();
                const dropped = e.dataTransfer.files[0];
                setFile(dropped);
                setError(null);
                setResult(null);
              }}
              onClick={() => document.getElementById('verify-file-input').click()}
              style={{ cursor: 'pointer' }}
            >
              <input
                id="verify-file-input"
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                tabIndex={-1}
              />
              <div className="flex flex-col items-center pointer-events-none">
                <div className="mb-2 animate-pulse-slow">
                  <svg className="w-12 h-12 text-green-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 16v2a2 2 0 002 2h6a2 2 0 002-2v-2M12 12v6m0 0l-4-4m4 4l4-4M12 4v8" /></svg>
                </div>
                <span className="text-green-600 font-semibold">Drag & drop or click to select a file</span>
                <span className="text-gray-400 text-xs mt-1">PDF, JPG, PNG (max 10MB)</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4 mt-4 bg-white rounded-lg shadow p-3 border border-green-100">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-5-5.917V4a2 2 0 10-4 0v1.083A6 6 0 004 11v3.159c0 .538-.214 1.055-.595 1.436L2 17h5m8 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              <div className="flex-1">
                <span className="block font-medium text-gray-800">{file.name}</span>
                <span className="block text-xs text-gray-400">{file.type.toUpperCase()} &bull; {(file.size/1024/1024).toFixed(2)} MB</span>
              </div>
              <button onClick={e => {e.stopPropagation(); setFile(null);}} className="ml-2 text-red-400 hover:text-red-600 transition">Remove</button>
            </div>
          )}

          <button
            onClick={handleVerify}
            disabled={loading || !file}
            className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Verifying...
              </>
            ) : (
              'Verify Certificate'
            )}
          </button>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {result && (
            <div className="mt-6">
              <div className={`p-6 rounded-lg border ${getStatusColor(result.verification_result.status)}`}>
                <div className="flex items-center mb-4">
                  <span className="text-3xl mr-3">
                    {getStatusIcon(result.verification_result.status)}
                  </span>
                  <div>
                    <h3 className="text-xl font-semibold capitalize">
                      {result.verification_result.status}
                    </h3>
                    <p className="text-sm opacity-75">
                      Confidence: {(result.verification_result.confidence * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>

                {result.verification_result.status === 'valid' && (
                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    {result.verification_result.institution && (
                      <div>
                        <strong>Institution:</strong>
                        <p>{result.verification_result.institution}</p>
                      </div>
                    )}
                    {result.verification_result.student_name && (
                      <div>
                        <strong>Student:</strong>
                        <p>{result.verification_result.student_name}</p>
                      </div>
                    )}
                    {result.verification_result.course_name && (
                      <div>
                        <strong>Course:</strong>
                        <p>{result.verification_result.course_name}</p>
                      </div>
                    )}
                    {result.verification_result.certificate_id && (
                      <div>
                        <strong>Certificate ID:</strong>
                        <p className="font-mono text-sm">{result.verification_result.certificate_id}</p>
                      </div>
                    )}
                  </div>
                )}

                {result.verification_result.message && (
                  <div className="mt-4">
                    <p className="text-sm">{result.verification_result.message}</p>
                  </div>
                )}

                {result.verification_result.possible_matches && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Possible Matches:</h4>
                    <div className="space-y-2">
                      {result.verification_result.possible_matches.slice(0, 3).map((match, index) => (
                        <div key={index} className="bg-white p-3 rounded border">
                          <div className="flex justify-between">
                            <span>{match.institution_name || 'Unknown Institution'}</span>
                            <span className="text-sm text-gray-500">
                              {(match.similarity * 100).toFixed(1)}% match
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Verify;