"use client";

import { useState } from "react";
import Link from "next/link";

export default function RequestBook()
{
  //form fields
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [isbn, setIsbn] = useState("");
  const [category, setCategory] = useState("");

  //states for sending the request
  const [loggedIn, setLoggedIn] = useState(true); //set to false if the user sends without a token
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function sendRequest(e: React.SyntheticEvent<HTMLFormElement>)
  {
    e.preventDefault();
    if (sending) //stop double submits
    {
      return;
    }

    setError("");
    setMessage("");

    const token = localStorage.getItem("token"); //get users login token

    if (!token) //if token invalid then user isnt logged in
    {
      setLoggedIn(false);
      return;
    }

    setSending(true);

    try
    {
      const response = await fetch("http://localhost:8080/book/request", { //send request to backend
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        //optional fields are sent as null when left blank
        body: JSON.stringify({
          title: title.trim(),
          author: author.trim(),
          isbn: isbn.trim() || null,
          category: category.trim() || null,
        }),
      });

      if (!response.ok) //check if backend response is valid
      {
        setError(response.status === 403
          ? "Your session has expired. Please log in again."
          : `Request failed (${response.status}). Please try again.`);
        return;
      }

      //success msg and clear the form so another book can be requested
      setMessage(`Your request for "${title.trim()}" was sent to the librarian.`);
      setTitle("");
      setAuthor("");
      setIsbn("");
      setCategory("");
    }
    catch (err) //catch backend error and display it to user
    {
      console.error("Book request error:", err);
      setError("Could not connect to the server. Please try again.");
    }
    finally
    {
      setSending(false);
    }
  }

  //ui
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-12">
      <div className="flex items-center justify-between gap-4 p-4">
        <h1 className="text-2xl font-bold">
          Request a Book
        </h1>

        <div className="flex gap-3">
          {/* back to catalog button */}
          <Link
            href="/catalog"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Back to Catalog
          </Link>

          {/* user dashboard button */}
          <Link
            href="/userdashboard"
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            My Dashboard
          </Link>
        </div>
      </div>

      {!loggedIn ? (
        <p role="alert" className="p-4 text-red-600 dark:text-red-400">
          Please <Link href="/login" className="underline">log in</Link> to request a book.
        </p>
      ) : (
        <div className="mx-auto max-w-md space-y-5 p-4">
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            Can&apos;t find a book in the catalog? Send its details to the librarian and they can add it.
          </p>

          {/* book request form */}
          <form onSubmit={sendRequest} className="space-y-5">
            <div className="space-y-1">
              <label htmlFor="title" className="text-sm font-medium">Title *</label>
              <input
                id="title"
                maxLength={50}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full rounded-lg border p-3"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="author" className="text-sm font-medium">Author *</label>
              <input
                id="author"
                maxLength={30}
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                required
                className="w-full rounded-lg border p-3"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="isbn" className="text-sm font-medium">ISBN (optional)</label>
              <input
                id="isbn"
                maxLength={13}
                type="text"
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
                className="w-full rounded-lg border p-3"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="category" className="text-sm font-medium">Category (optional)</label>
              <input
                id="category"
                maxLength={20}
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border p-3"
              />
            </div>

            {/* error and success msgs */}
            {error && (
              <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
            {message && (
              <p role="status" className="text-sm text-blue-600 dark:text-blue-400">{message}</p>
            )}

            <button
              type="submit"
              disabled={sending}
              className="w-full rounded-lg bg-blue-700 p-3 text-white hover:bg-blue-800 disabled:opacity-50"
            >
              {sending ? "Sending Request..." : "Send Request"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
