import React from "react"

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      {/* TODO: Implement login form */}
      <form className="flex flex-col gap-2 w-80 max-w-full">
        <input className="border rounded px-3 py-2" type="text" placeholder="Username" name="username" />
        <input className="border rounded px-3 py-2" type="password" placeholder="Password" name="password" />
        <button className="bg-blue-600 text-white rounded px-3 py-2 mt-2" type="submit">Login</button>
      </form>
      <div className="mt-4 text-sm">
        Don't have an account? <a href="/register" className="text-blue-600 underline">Register</a>
      </div>
    </div>
  )
}
