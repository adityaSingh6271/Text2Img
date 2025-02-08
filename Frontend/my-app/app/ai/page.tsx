"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AIImageGenerator() {
  const router = useRouter();
  const [username, setUsername] = useState("Creator");
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [style, setStyle] = useState("Realistic");
  const [aspectRatio, setAspectRatio] = useState("square");
  const [samples, setSamples] = useState(1);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

  // Load username from localStorage if available
  useEffect(() => {
    const storedUser = localStorage.getItem("username");
    if (storedUser) {
      setUsername(storedUser);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("username");
    router.push("/");
  };

  const generateImage = async () => {
    if (!API_KEY) {
      setError("API configuration error. Please contact support.");
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
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          prompt,
          negprompt: negativePrompt,
          style,
          aspect_ratio: aspectRatio,
          samples: Math.min(samples, 4), // Ensure max 4 samples
          safe_filter: true,
        }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      if (data.process_id) {
        pollForImage(data.process_id);
      } else {
        throw new Error("Failed to start image generation process");
      }
    } catch (err: any) {
      console.error("Generation error:", err);
      setError(err.message || "Image generation failed. Please try again.");
      setLoading(false);
    }
  };

  const pollForImage = async (processId: string) => {
    const statusUrl = `https://api.monsterapi.ai/v1/status/${processId}`;
    let attempts = 0;
    const maxAttempts = 30;

    const checkStatus = async () => {
      if (attempts >= maxAttempts) {
        setError("Generation timed out. Please try again.");
        setLoading(false);
        return;
      }
      attempts++;

      try {
        const response = await fetch(statusUrl, {
          headers: { Authorization: `Bearer ${API_KEY}` },
        });
        
        if (!response.ok) throw new Error(`Status check failed: ${response.status}`);
        
        const statusData = await response.json();
        console.log("Generation status:", statusData.status);

        switch (statusData.status) {
          case "IN_PROGRESS":
          case "IN_QUEUE":
            setTimeout(checkStatus, 2000);
            break;
          case "COMPLETED":
            if (statusData.result?.output?.length) {
              setImages(statusData.result.output);
            } else {
              throw new Error("No images found in response");
            }
            setLoading(false);
            break;
          default:
            throw new Error(statusData.error?.message || "Generation process failed");
        }
      } catch (err: any) {
        console.error("Polling error:", err);
        setError(err.message || "Error checking generation status");
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
            AI Image Generation Platform
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-5 rounded-lg shadow-lg transition-all duration-300 hover:scale-105"
        >
          🚪 Logout
        </button>
      </header>

      <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-md mx-auto border border-gray-700">
        <div className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium">Creative Prompt</label>
            <input
              type="text"
              className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A futuristic cityscape at sunset..."
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">Exclusions</label>
            <input
              type="text"
              className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              placeholder="Avoid elements in the image..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-sm font-medium">Style</label>
              <select
                className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={style}
                onChange={(e) => setStyle(e.target.value)}
              >
                {["Realistic", "Anime", "Digital Art", "Painterly", "Cyberpunk"].map((style) => (
                  <option key={style} value={style}>{style}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">Aspect Ratio</label>
              <select
                className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value)}
              >
                {["square", "portrait", "landscape"].map((ratio) => (
                  <option key={ratio} value={ratio}>{ratio}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">Number of Images</label>
            <select
              className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={samples}
              onChange={(e) => setSamples(Number(e.target.value))}
            >
              {[1, 2, 3, 4].map((num) => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>

          <button
            className={`w-full py-3 mt-4 rounded-lg font-semibold transition-all duration-300 ${
              loading 
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 hover:scale-[1.02]"
            }`}
            onClick={generateImage}
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Generating...</span>
              </div>
            ) : (
              "Create Magic ✨"
            )}
          </button>

          {error && (
            <div className="mt-4 p-3 bg-red-900/50 text-red-300 rounded-lg border border-red-800">
              {error}
            </div>
          )}
        </div>
      </div>

      {images.length > 0 && (
        <section className="mt-12 max-w-6xl mx-auto px-4">
          <h3 className="text-2xl font-bold text-center mb-8 text-blue-400">
            Generated Masterpieces
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((img, index) => (
              <div
                key={index}
                className="relative group bg-gray-800 rounded-xl overflow-hidden shadow-2xl transform transition-all duration-300 hover:scale-105"
              >
                <div className="relative h-64">
                  <Image
                    src={img}
                    alt={`AI Generated Art ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4">
                  <p className="text-lg font-semibold text-center mb-3">
                    Artwork #{index + 1}
                  </p>
                  <div className="flex space-x-3">
                    <a
                      href={img}
                      download={`ai-art-${index + 1}.jpg`}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Download
                    </a>
                    <button
                      className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                      onClick={() => navigator.clipboard.writeText(img)}
                    >
                      Copy URL
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <style jsx>{`
        @keyframes slideIn {
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in {
          animation: slideIn 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
      `}</style>
    </div>
  );
}