"use client";

import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle, faGithub } from "@fortawesome/free-brands-svg-icons";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-10 bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white">
      <h1 className="text-5xl font-extrabold mb-10 animate-fade-in">
        🚀 AI Image Generator
      </h1>

      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-lg flex flex-col items-center space-y-6">
        <p className="text-lg font-medium text-gray-200">
          Sign in to generate AI-powered images!
        </p>

        <div className="flex space-x-4">
          {/* Google Login Button */}
          <Link
            href="http://localhost:5000/auth/google"
            className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-full shadow-md transition duration-300 transform hover:scale-105"
          >
            <FontAwesomeIcon icon={faGoogle} className="w-4 h-4 text-white" />
            <span>Login with Google</span>
          </Link>

          {/* GitHub Login Button */}
          <Link
            href="http://localhost:5000/auth/github"
            className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 px-6 rounded-full shadow-md transition duration-300 transform hover:scale-105"
          >
            <FontAwesomeIcon icon={faGithub} className="w-4 h-4 text-white" />
            <span>Login with GitHub</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
