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
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Verify Certificate
        </h1>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Upload Certificate for Verification</h2>
            <p className="text-gray-600 mb-4">
              Upload a certificate image or PDF to verify its authenticity against our database
            </p>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 mb-4">
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
            />
          </div>

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