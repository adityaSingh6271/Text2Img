"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AIImageGenerator() {
  const router = useRouter();
  const username = "Creator"; // Replace with dynamic user authentication if needed

  // State for user input
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [style, setStyle] = useState("Realistic");
  const [aspectRatio, setAspectRatio] = useState("square");
  const [samples, setSamples] = useState(1);

  // State for API response
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load API key securely from .env.local
  const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

  const generateImage = async () => {
    if (!API_KEY) {
      setError("API key is missing. Please set it in your .env.local file.");
      return;
    }

    if (!prompt.trim()) {
      setError("Please enter a prompt to generate an image.");
      return;
    }

    setLoading(true);
    setError("");
    setImages([]);

    try {
      const response = await fetch("https://api.monsterapi.ai/v1/generate/txt2img", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: API_KEY,
        },
        body: JSON.stringify({
          prompt,
          negprompt: negativePrompt,
          style,
          aspect_ratio: aspectRatio,
          samples,
          safe_filter: true,
        }),
      });

      const data = await response.json();
      console.log("API Response:", data);

      if (data.process_id) {
        pollForImage(data.process_id);
      } else {
        throw new Error("Failed to get process ID from API response.");
      }
    } catch (err: any) {
      console.error("Error in generateImage:", err);
      setError(err.message || "Image generation failed.");
      setLoading(false);
    }
  };

  const pollForImage = async (processId: string) => {
    const statusUrl = `https://api.monsterapi.ai/v1/status/${processId}`;
    let attempts = 0;
    const maxAttempts = 30;

    const checkStatus = async () => {
      if (attempts >= maxAttempts) {
        setError("Image generation timed out. Please try again.");
        setLoading(false);
        return;
      }
      attempts++;

      try {
        const response = await fetch(statusUrl, {
          method: "GET",
          headers: { Authorization: API_KEY! },
        });

        const statusData = await response.json();
        console.log("Status Response:", statusData);

        if (statusData.status === "IN_PROGRESS" || statusData.status === "IN_QUEUE") {
          setTimeout(checkStatus, 2000);
        } else if (statusData.status === "COMPLETED" && statusData.result?.output) {
          setImages(statusData.result.output);
          setLoading(false);
        } else {
          setError("Image generation failed. Please try again.");
          setLoading(false);
        }
      } catch (err: any) {
        console.error("Error in checkStatus:", err);
        setError("Error checking status: " + err.message);
        setLoading(false);
      }
    };

    checkStatus();
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white">
      <header className="flex flex-col sm:flex-row items-center justify-between mb-8">
        <div className="mb-4 sm:mb-0 animate-slide-in">
          <h2 className="text-3xl font-bold">
            Hello <span className="text-blue-400">{username}</span>
          </h2>
          <p className="text-lg text-gray-300">Welcome to AI Image Generation!</p>
        </div>
        <button
          onClick={() => router.push("/")}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-5 rounded shadow-lg transition hover:scale-105"
        >
          🚪 Logout
        </button>
      </header>

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md mx-auto">
        <label className="block mb-2">Prompt</label>
        <input
          type="text"
          className="w-full p-2 mb-4 bg-gray-700 rounded border border-gray-600 focus:ring-2 focus:ring-blue-500"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your image prompt"
        />

        <label className="block mb-2">Negative Prompt</label>
        <input
          type="text"
          className="w-full p-2 mb-4 bg-gray-700 rounded border border-gray-600 focus:ring-2 focus:ring-blue-500"
          value={negativePrompt}
          onChange={(e) => setNegativePrompt(e.target.value)}
          placeholder="Enter negative details"
        />

        <label className="block mb-2">Style</label>
        <select
          className="w-full p-2 mb-4 bg-gray-700 rounded border border-gray-600 focus:ring-2 focus:ring-blue-500"
          value={style}
          onChange={(e) => setStyle(e.target.value)}
        >
          <option value="Realistic">Realistic</option>
          <option value="Anime">Anime</option>
          <option value="Digital Art">Digital Art</option>
        </select>

        <button
          className={`w-full py-3 mt-4 rounded text-white font-semibold ${
            loading ? "bg-gray-600" : "bg-blue-500 hover:bg-blue-600"
          }`}
          onClick={generateImage}
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate Image"}
        </button>

        {error && <p className="text-red-500 mt-3">{error}</p>}
      </div>

      {images.length > 0 && (
        <section className="mt-10 max-w-5xl mx-auto">
          <h3 className="text-2xl font-bold text-center mb-6 text-blue-400">Generated Images</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {images.map((img, index) => (
              <div key={index} className="border border-gray-700 rounded-lg overflow-hidden shadow-xl">
                <img src={img} alt={`Generated ${index + 1}`} className="w-full h-64 object-cover" />
                <a href={img} download className="block text-center text-blue-500 mt-2">Download</a>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
