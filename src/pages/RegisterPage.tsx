import React from "react"

export default function RegisterPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Register</h1>
      {/* TODO: Implement register form */}
      <form className="flex flex-col gap-2 w-80 max-w-full">
        <input className="border rounded px-3 py-2" type="text" placeholder="Username" name="username" />
        <input className="border rounded px-3 py-2" type="password" placeholder="Password" name="password" />
        <button className="bg-blue-600 text-white rounded px-3 py-2 mt-2" type="submit">Register</button>
      </form>
      <div className="mt-4 text-sm">
        Already have an account? <a href="/login" className="text-blue-600 underline">Login</a>
      </div>
    </div>
  )
}
