'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { FaGoogle, FaSignOutAlt, FaSearch, FaSpinner } from 'react-icons/fa';

export default function Home() {
  const { data: session, status } = useSession();
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('[Debug] Authentication Status:', status);
    console.log('[Debug] Session Data:', session);
    console.log('[Debug] Window Location:', window.location.href);
  }, [session, status]);

  const handleSignIn = async () => {
    console.log('[Debug] Starting Google Sign In...');
    try {
      const result = await signIn('google', {
        redirect: true,
        callbackUrl: '/',
      });
      console.log('[Debug] Sign In Result:', result);
    } catch (error) {
      console.error('[Debug] Sign In Error:', error);
    }
  };

  const handleSignOut = async () => {
    console.log('[Debug] Starting Sign Out...');
    try {
      const result = await signOut();
      console.log('[Debug] Sign Out Result:', result);
    } catch (error) {
      console.error('[Debug] Sign Out Error:', error);
    }
  };

  const handleFetchEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/fetch-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recipientEmail: email, subject }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch email');
      }
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-700">Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto p-6">
        <nav className="flex justify-between items-center mb-8 bg-white rounded-lg shadow-sm p-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Email Fetcher
          </h1>
          {status === 'authenticated' ? (
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors duration-200 shadow-sm"
            >
              <FaSignOutAlt /> Sign Out
            </button>
          ) : (
            <button
              onClick={handleSignIn}
              className="flex items-center gap-2 bg-white text-gray-700 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 shadow-sm"
            >
              <FaGoogle className="text-blue-500" /> Sign In with Google
            </button>
          )}
        </nav>

        {status === 'authenticated' ? (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-semibold">
                  {session.user?.email?.[0].toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Logged in as</p>
                <p className="font-medium text-gray-700">{session.user?.email}</p>
              </div>
            </div>
            
            <form onSubmit={handleFetchEmail} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Recipient Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-black"
                  placeholder="Enter recipient email"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-black"
                  placeholder="Enter email subject"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors duration-200 shadow-sm"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Fetching...
                  </>
                ) : (
                  <>
                    <FaSearch />
                    Fetch Email
                  </>
                )}
              </button>
            </form>

            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-lg flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            {result && (
              <div className="mt-6">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Result:</h2>
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 overflow-auto">
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-600 mb-2">Snippet:</h3>
                    <p className="text-gray-700">{result.snippet}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 mb-2">Full Payload:</h3>
                    <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                      {JSON.stringify(result.payload, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center bg-white rounded-xl shadow-lg p-12">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaGoogle className="text-3xl text-blue-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Welcome to Email Fetcher</h1>
            <p className="text-gray-600 mb-8">
              Sign in with your Google account to start fetching and viewing your emails.
            </p>
            <button
              onClick={handleSignIn}
              className="inline-flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors duration-200 shadow-sm"
            >
              <FaGoogle /> Sign In with Google
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
