"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FaSearch, FaSpinner } from "react-icons/fa";
import { logger } from "@/lib/logger";

const urlsample =
  "http://localhost:3000/email?recipientEmail=aditipolkam@gmail.com&subject=Your OTP Code&accessToken=<your access token>";

export default function FetchDirectPage() {
  const searchParams = useSearchParams();
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const recipientEmail = searchParams.get("recipientEmail");
  const subject = searchParams.get("subject");
  const accessToken = searchParams.get("accessToken");

  useEffect(() => {
    const fetchEmail = async () => {
      if (!recipientEmail || !subject || !accessToken) {
        setError("Missing required query parameters.");
        return;
      }

      setLoading(true);
      setError("");
      setResult(null);

      logger.info("Direct email fetch initiated", {
        recipientEmail,
        subject,
        usingAccessToken: !!accessToken,
      });

      try {
        const response = await fetch("/api/fetch-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ recipientEmail, subject }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch email");
        }

        logger.info("Direct email fetch successful", {
          recipientEmail,
          subject,
        });

        setResult(data);
      } catch (err: any) {
        logger.error("Direct email fetch failed", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEmail();
  }, [recipientEmail, subject, accessToken]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <FaSearch /> Direct Email Fetch
        </h1>

        {loading && (
          <div className="flex items-center gap-2 text-blue-600 mb-4">
            <FaSpinner className="animate-spin" />
            Fetching email...
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-700 border border-red-200 p-4 rounded-lg mb-4">
            <strong>Error:</strong> {error}
          </div>
        )}

        {result && (
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-medium text-gray-600 mb-2">
                Snippet:
              </h2>
              <p className="text-gray-800">{result.snippet}</p>
            </div>
            <div>
              <h2 className="text-sm font-medium text-gray-600 mb-2">
                Payload:
              </h2>
              <pre className="bg-gray-50 border border-gray-100 p-4 rounded-lg overflow-auto text-sm text-gray-600">
                {JSON.stringify(result.payload, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
