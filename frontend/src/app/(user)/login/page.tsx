"use client";

import { useState } from "react"; 
import { useRouter } from "next/navigation";

export default function loginPage() 
{
  const [username, setUsername] = useState("");  //store username on ui
  const [password, setPassword] = useState(""); //store password on ui
  const [error, setError] = useState(""); //error handling for login
  const [loading, setLoading] = useState(false); //loading state

  const router = useRouter(); 

   // Runs when the user clicks Sign In
  async function handleLogin(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try { //checks if username and password are valid in backend
      const response = await fetch("http://localhost:8080/auth/login", {
        method: "POST",
        headers: {"Content-Type": "application/json",},
        body: JSON.stringify({ username, password }), //sends info over
      });

      if (!response.ok) 
      { //if repsonse is invalid, user entered a invalid username or password
        setError("Invalid username or password.");
        return;
      }

      const data = await response.json(); //parse backends response

      localStorage.setItem("token", data.token); //store login token

      if (data.role === "ROLE_ADMIN") 
        { //if user is a librarian, go to librarian page instead of catalog
    router.push("/librarian");
        } 
        else 
        {//otherwise go to catalog
    router.push("/catalog");
        }
  
    } 
    catch 
    { //backend wasnt running
      setError("Could not connect to the server. Check that the backend is running.");
    } 
    finally 
    { 
      setLoading(false);
    }
  }


  return (
    //main page contents, sets background and page layout for elements
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <div className="w-full max-w-md space-y-5 rounded-xl bg-zinc-50 font-sans dark:bg-black">
        <h1 className="text-center text-3xl font-bold">
          Library System
        </h1>

    <form onSubmit={handleLogin} className="space-y-5">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full rounded-lg border p-3"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border p-3"
        />

        {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-700 p-3 text-white hover:bg-blue-800"
         >
          {loading ? "Signing In..." : "Sign In"}
        </button>
        </form>
        

        <p className="text-center text-sm">
          Don't have an account? <a href="/register">Register</a>
        </p>
      </div>
    </main>
  );
}


