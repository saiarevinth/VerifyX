import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-800 mb-6">
            Certificate Authenticity Validator
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Secure, fast, and reliable certificate validation system using advanced OCR and QR technology
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Link to="/upload" className="group">
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300 border border-gray-200">
              <div className="text-4xl mb-4">📤</div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 group-hover:text-blue-600 transition-colors">
                Upload Certificate
              </h2>
              <p className="text-gray-600">
                Upload legacy certificates for OCR processing or digital certificates for QR code generation
              </p>
            </div>
          </Link>

          <Link to="/verify" className="group">
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300 border border-gray-200">
              <div className="text-4xl mb-4">✅</div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 group-hover:text-green-600 transition-colors">
                Verify Certificate
              </h2>
              <p className="text-gray-600">
                Verify the authenticity of certificates against institutional records
              </p>
            </div>
          </Link>
        </div>

        <div className="text-center mt-16">
          <Link to="/dashboard" className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            View Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;