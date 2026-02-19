import { getCurrentUser } from "@/lib/auth";

export default async function AuthTestPage() {
  const user = await getCurrentUser();
  
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-2xl mb-4">Auth Test Page</h1>
      {user ? (
        <div>
          <p>✅ User authenticated:</p>
          <pre className="bg-gray-800 p-4 rounded mt-2">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
      ) : (
        <p>❌ No user found</p>
      )}
    </div>
  );
}
