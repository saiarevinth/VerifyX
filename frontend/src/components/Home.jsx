import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-blue-50 to-white flex flex-col justify-between">

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 drop-shadow-lg">
              Certificate Authenticity Validator
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto mb-2">
              Secure, fast, and reliable certificate validation using advanced OCR &amp; QR technology
            </p>
            <p className="text-base text-gray-400 max-w-xl mx-auto">
              Empowering institutions and individuals to verify credentials with confidence.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-10 max-w-4xl mx-auto">
            {/* Upload Card */}
            <Link to="/upload" className="group">
              <div className="bg-white/90 rounded-3xl shadow-2xl p-10 border-t-4 border-blue-500 hover:scale-105 hover:shadow-blue-200 transition-all duration-300 flex flex-col items-center text-center">
                <div className="bg-blue-100 p-4 rounded-full mb-5 animate-bounce-slow">
                  <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" /></svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors">Upload Certificate</h2>
                <p className="text-gray-500 mb-2">Upload legacy certificates for OCR processing or digital certificates for QR code generation.</p>
                <span className="inline-block mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition">Start Upload</span>
              </div>
            </Link>

            {/* Verify Card */}
            <Link to="/verify" className="group">
              <div className="bg-white/90 rounded-3xl shadow-2xl p-10 border-t-4 border-green-500 hover:scale-105 hover:shadow-green-200 transition-all duration-300 flex flex-col items-center text-center">
                <div className="bg-green-100 p-4 rounded-full mb-5 animate-pulse-slow">
                  <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-green-600 transition-colors">Verify Certificate</h2>
                <p className="text-gray-500 mb-2">Verify the authenticity of certificates against institutional records.</p>
                <span className="inline-block mt-2 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold shadow hover:bg-green-700 transition">Start Verification</span>
              </div>
            </Link>
          </div>

          <div className="text-center mt-20">
            <Link to="/dashboard" className="inline-flex items-center px-7 py-3 bg-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:bg-indigo-700 transition-colors text-lg">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h4v11H3zM17 3h4v18h-4zM10 14h4v7h-4z" /></svg>
              View Dashboard
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 bg-white/80 backdrop-blur shadow-inner mt-10">
        <div className="container mx-auto px-4 text-center text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} VerifyX. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Home;