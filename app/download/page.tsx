"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Head from "next/head";
import "../home.css";

interface Platform {
  name: string;
  icon: string;
  key: string;
}

interface FileInfo {
  size: string;
  url: string;
  version?: string;
  filename?: string;
}

export default function Downloads() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [cursorSize, setCursorSize] = useState(20);
  const [isHoveringButton, setIsHoveringButton] = useState(false);
  const [fileInfo, setFileInfo] = useState<Record<string, FileInfo>>({});
  const [latestVersion, setLatestVersion] = useState("0.9.3");
  
  const platforms: Platform[] = [
    {
      name: "Windows",
      icon: "🖥️",
      key: "windows"
    },
    {
      name: "macOS",
      icon: "🍎",
      key: "mac"
    },
    {
      name: "Linux",
      icon: "🐧",
      key: "linux"
    }
  ];

  useEffect(() => {
    const fetchFileInfo = async () => {
      try {
        const promises = platforms.map(async (platform) => {
          const response = await fetch(`/api/file-size?platform=${platform.key}`);
          if (response.ok) {
            const data = await response.json();
            return { 
              platformKey: platform.key, 
              info: { 
                size: data.size,
                url: data.url,
                version: data.version,
                filename: data.filename
              } 
            };
          }
          return { 
            platformKey: platform.key, 
            info: { 
              size: "Unknown",
              url: "#" 
            } 
          };
        });
        
        const results = await Promise.all(promises);
        const info: Record<string, FileInfo> = {};
        
        results.forEach((result) => {
          info[result.platformKey] = result.info;
        });
        
        setFileInfo(info);
        
        for (const result of results) {
          if (result.info.version) {
            setLatestVersion(result.info.version.replace(/^v/i, ''));
            break;
          }
        }
      } catch (error) {
        console.error("Failed to fetch file info:", error);
        const fallbackInfo: Record<string, FileInfo> = {};
        platforms.forEach((platform) => {
          fallbackInfo[platform.key] = { 
            size: "Unknown",
            url: "#" 
          };
        });
        setFileInfo(fallbackInfo);
      }
    };

    fetchFileInfo();
    
    const loadingSequence = setTimeout(() => {
      document.body.classList.add("loaded");
      setIsLoaded(true);
    }, 2000);

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      setCursorPosition({ x: clientX, y: clientY });
    };

    const handleMouseUp = () => {
      setCursorSize(20);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      clearTimeout(loadingSequence);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const handleDownload = (platform: Platform) => {
    const info = fileInfo[platform.key];
    
    if (!info || !info.url || info.url === "#") {
      const notification = document.createElement("div");
      notification.className = "fixed bottom-8 right-8 bg-red-500 text-white px-6 py-4 rounded-sm animate-pulse z-50";
      notification.innerText = `Download link unavailable for ${platform.name}`;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 3000);
      return;
    }
    
    window.location.href = info.url;
    
    const notification = document.createElement("div");
    notification.className = "fixed bottom-8 right-8 bg-zombie-green text-black px-6 py-4 rounded-sm animate-pulse z-50";
    notification.innerText = `Downloading ${platform.name} version...`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 3000);
  };

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=no"
        />
        <title>Downloads | Undead Courier</title>
      </Head>
      
      <div className="bg-black relative min-h-screen">
        <div
          className={`custom-cursor ${isHoveringButton ? "cursor-active" : ""} hidden md:block`}
          style={{
            left: `${cursorPosition.x}px`,
            top: `${cursorPosition.y}px`,
            width: `${cursorSize}px`,
            height: `${cursorSize}px`,
          }}
        >
          <div className="cursor-trails"></div>
        </div>

        <div className="fixed inset-0 z-0 opacity-40 pointer-events-none">
          <div className="fog-layer fog-1"></div>
          <div className="fog-layer fog-2"></div>
          <div className="fog-layer fog-3"></div>
        </div>

        <div className="blood-vignette fixed inset-0 pointer-events-none z-10 opacity-30"></div>
        <div className="film-grain fixed inset-0 pointer-events-none z-20 opacity-20"></div>

        {!isLoaded ? (
          <div className="loading-screen flex flex-col items-center justify-center fixed inset-0 bg-black z-50">
            <div className="relative">
              <div className="loading-circle"></div>
              <div className="loading-zombie"></div>
            </div>
            <p className="text-toxic-green mt-8 animate-pulse loading-text">
              Preparing infection files<span className="dot-1">.</span>
              <span className="dot-2">.</span>
              <span className="dot-3">.</span>
            </p>
          </div>
        ) : (
          <main className="relative py-16 px-4">
            <div className="container mx-auto max-w-4xl">
              <Link href="/" className="block mb-12 text-center">
                <Image
                  src="/logo.png"
                  alt="Undead Courier"
                  width={350}
                  height={120}
                  className="logo-glow mx-auto"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "";
                  }}
                />
              </Link>
              
              <div className="py-8">
                <h1 className="text-6xl text-toxic-green text-center mb-6 animate-on-scroll glitch-text">
                  <span className="title-decoration">DOWNLOAD</span>
                </h1>
                <div className="text-xl text-gray-300 text-center mb-16 max-w-2xl mx-auto relative">
                  <p className="mb-2">Get Undead Courier v{latestVersion} and begin your mission.</p>
                  <p>Join the fight for humanity&apos;s survival.</p>
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-toxic-green"></div>
                </div>
                
                <div className="download-container grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                  {platforms.map((platform) => (
                    <div 
                      key={platform.key} 
                      className="download-card border-2 border-zombie-green hover:border-toxic-green relative overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-glow bg-gray-900"
                    >
                      <div className="corner-decoration top-left"></div>
                      <div className="corner-decoration top-right"></div>
                      <div className="corner-decoration bottom-left"></div>
                      <div className="corner-decoration bottom-right"></div>
                      
                      <div className="p-8 text-center">
                        <div className="platform-icon text-6xl mb-6">{platform.icon}</div>
                        <h3 className="text-3xl text-toxic-green mb-4 glitch-text-subtle">{platform.name}</h3>
                        <div className="text-gray-400 mb-2">
                          Size: {fileInfo[platform.key]?.size || "Calculating..."}
                        </div>
                        {fileInfo[platform.key]?.filename && (
                          <div className="text-gray-500 text-sm mb-6 truncate">
                            {fileInfo[platform.key]?.filename}
                          </div>
                        )}
                        <button
                          className="w-full bg-zombie-green hover:bg-toxic-green text-black py-4 uppercase font-bold text-lg transition-all duration-300 relative overflow-hidden group"
                          onClick={() => handleDownload(platform)}
                          onMouseEnter={() => setIsHoveringButton(true)}
                          onMouseLeave={() => setIsHoveringButton(false)}
                        >
                          <span className="relative z-10">Download</span>
                          <span className="absolute inset-0 w-full h-full bg-toxic-green transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                        </button>
                      </div>
                      
                      <div className="absolute bottom-0 left-0 w-full h-1 bg-toxic-green opacity-50"></div>
                    </div>
                  ))}
                </div>
                
                <div className="text-center">
                  <Link 
                    href="/"
                    className="inline-block bg-transparent border-2 border-zombie-green hover:border-toxic-green text-toxic-green hover:text-white px-8 py-4 transition-colors duration-300"
                    onMouseEnter={() => setIsHoveringButton(true)}
                    onMouseLeave={() => setIsHoveringButton(false)}
                  >
                    BACK TO HOME
                  </Link>
                </div>
              </div>
            </div>
            
            <footer className="footer py-12 relative bg-black mt-16">
            <div className="container mx-auto px-4">
                <div className="flex flex-col items-center">
                  <Image
                    src="/logo.png"
                    alt="Undead Courier"
                    width={200}
                    height={70}
                    className="opacity-70 mb-6"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "";
                    }}
                  />
                  
                  <p className="text-gray-600 text-sm text-center">
                    &copy; {new Date().getFullYear()} Undead Courier. All rights reserved.<br />
                    <Link href="/" className="text-gray-500 hover:text-toxic-green transition-colors">
                      Home
                    </Link> | <Link href="/downloads" className="text-gray-500 hover:text-toxic-green transition-colors">
                      Downloads
                    </Link> | <Link href="/leaderboard" className="text-gray-500 hover:text-toxic-green transition-colors">
                      Leaderboard
                    </Link>
                  </p>
                </div>
              </div>
            </footer>
          </main>
        )}
      </div>
    </>
  );
}