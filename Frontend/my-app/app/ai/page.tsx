"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AIImageGenerator() {
  const router = useRouter();
  const username = "Creator"; // Hardcoded username; replace with dynamic value if available
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [style, setStyle] = useState("Realistic");
  const [aspectRatio, setAspectRatio] = useState("square");
  const [samples, setSamples] = useState(1);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // A simple logout button that redirects to the home page
  const handleLogout = () => {
    router.push("/");
  };

  // Replace with your actual API key if needed
  const API_KEY =
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6ImIxNmM4YjE2Y2Y1YTk4YWNhNDkzODg4NmFlZWQzNTA2IiwiY3JlYXRlZF9hdCI6IjIwMjUtMDItMDZUMDg6Mjk6MDEuMDUxNzYxIn0.xq546DN9OBdTnTyffa7tALPWuuQhAXAj4HX0Q2rAbbg";

  const generateImage = async () => {
    // Clear the form fields immediately after clicking the button.
    setPrompt("");
    setNegativePrompt("");
    
    setLoading(true);
    setError("");
    setImages([]);

    try {
      const response = await fetch("https://api.monsterapi.ai/v1/generate/txt2img", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${API_KEY}`,
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
        throw new Error("Process ID not received");
      }
    } catch (err: any) {
      console.error("Error in generateImage:", err);
      setError(err.message);
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
          headers: {
            Authorization: `${API_KEY}`,
          },
        });

        const statusData = await response.json();
        console.log("Status Response:", statusData);

        if (
          statusData.status === "IN_PROGRESS" ||
          statusData.status === "IN_QUEUE"
        ) {
          setTimeout(checkStatus, 2000);
        } else if (statusData.status === "COMPLETED") {
          if (statusData.result?.output && statusData.result.output.length > 0) {
            setImages(statusData.result.output);
            setLoading(false);
          } else {
            setTimeout(checkStatus, 2000);
          }
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
          <p className="text-lg text-gray-300">
            Welcome to AI Image Generation with futuristic style!
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-5 rounded shadow-lg transition transform hover:scale-105"
        >
          🚪 Logout
        </button>
      </header>

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md mx-auto">
        <label className="block mb-2">Prompt</label>
        <input
          type="text"
          className="w-full p-2 mb-4 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your image prompt"
        />

        <label className="block mb-2">Negative Prompt</label>
        <input
          type="text"
          className="w-full p-2 mb-4 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={negativePrompt}
          onChange={(e) => setNegativePrompt(e.target.value)}
          placeholder="Enter negative prompt details"
        />

        <label className="block mb-2">Style</label>
        <select
          className="w-full p-2 mb-4 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={style}
          onChange={(e) => setStyle(e.target.value)}
        >
          <option value="Realistic">Realistic</option>
          <option value="Anime">Anime</option>
          <option value="Digital Art">Digital Art</option>
        </select>

        <label className="block mb-2">Aspect Ratio</label>
        <select
          className="w-full p-2 mb-4 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={aspectRatio}
          onChange={(e) => setAspectRatio(e.target.value)}
        >
          <option value="square">Square (1:1)</option>
          <option value="portrait">Portrait (2:3)</option>
          <option value="landscape">Landscape (3:2)</option>
        </select>

        <label className="block mb-2">Number of Images</label>
        <select
          className="w-full p-2 mb-4 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={samples}
          onChange={(e) => setSamples(Number(e.target.value))}
        >
          {[1, 2, 3, 4].map((num) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </select>

        <button
          className={`w-full py-3 mt-4 rounded text-white font-semibold transition-colors ${
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
          <h3 className="text-2xl font-bold text-center mb-6 text-blue-400">
            Generated Images
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {images.map((img, index) => (
              <div
                key={index}
                className="relative group border border-gray-700 rounded-lg overflow-hidden shadow-xl"
              >
                <img
                  src={img}
                  alt={`Generated ${index + 1}`}
                  className="w-full h-64 object-cover transform transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-white text-lg font-semibold mb-2">
                    Image {index + 1}
                  </p>
                  <a
                    href={img}
                    download={`generated-image-${index + 1}.jpg`}
                    className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded shadow transition transform hover:scale-105"
                  >
                    Download
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Custom slide-in animation */}
      <style jsx>{`
        @keyframes slideIn {
          0% {
            transform: translateX(-100%);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slideIn 1.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
