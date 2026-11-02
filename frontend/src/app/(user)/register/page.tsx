"use client";

import { useState } from "react"; 
import { useRouter } from "next/navigation";

export default function registerPage() 
{
  const [username, setUsername] = useState("");  //store username on ui
  const [email, setEmail] = useState(""); //store email on ui
  const [password, setPassword] = useState(""); //store password on ui
  const [error, setError] = useState(""); //error handling for login
  const [loading, setLoading] = useState(false); //loading state

  const router = useRouter(); 

   // Runs when the user clicks Register
  async function handleRegister(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try { 
      const response = await fetch("http://localhost:8080/auth/register", {
        method: "POST",
        headers: {"Content-Type": "application/json",},
        body: JSON.stringify({ username, email, password }), //sends info over
      });

      if (!response.ok) 
      { //if repsonse is invalid, user entered a invalid username, email or password
        setError( response.status === 409
            ? "That username or email is already registered." //if true, user already exists
            : "Registration failed. Check your information and try again."); //false, another error occured
        return;
      }

      const data = await response.json(); //parse backends response

      localStorage.setItem("token", data.token); //store login token
      localStorage.setItem("role", data.role); //store role so pages can check access
      router.push("/catalog"); //redirects user to the catalog upon success
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
          Create an Account
        </h1>

    <form onSubmit={handleRegister} className="space-y-5">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full rounded-lg border p-3"
        />

        <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
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
          {loading ? "Creating Account..." : "Sign Up"}
        </button>
        </form>
        

        <p className="text-center text-sm">
          Already have an account? <a href="/login">Log In</a>
        </p>
      </div>
    </main>
  );
}


 //<div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
   //   <h1>Library System</h1>
  //  </div>