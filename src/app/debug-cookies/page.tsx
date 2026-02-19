"use client";

import { useEffect, useState } from "react";

export default function CookieDebugPage() {
  const [cookies, setCookies] = useState<string>("");

  useEffect(() => {
    setCookies(document.cookie);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-2xl mb-4">Cookie Debug Page</h1>
      <div>
        <h2 className="text-lg mb-2">Document cookies:</h2>
        <pre className="bg-gray-800 p-4 rounded">
          {cookies || "No cookies found"}
        </pre>
      </div>
      <div className="mt-4">
        <button 
          onClick={() => setCookies(document.cookie)}
          className="bg-pink-600 px-4 py-2 rounded text-white"
        >
          Refresh Cookies
        </button>
      </div>
    </div>
  );
}
