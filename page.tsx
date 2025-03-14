"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Head from "next/head";
import "./home.css"
import Link from "next/link";
import { FaLinux, FaWindows } from "react-icons/fa";
import { SiMacos } from "react-icons/si";


interface FeatureCardProps {
  index: number;
  title: string;
  description: string;
  icon: string;
}

interface PlatformIconProps {
  platform: string;
}

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [cursorSize, setCursorSize] = useState(20);
  const [isHoveringButton, setIsHoveringButton] = useState(false);
  const zombieRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in");
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    const elements = document.querySelectorAll(".animate-on-scroll");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [isLoaded]);

  useEffect(() => {
    const loadingSequence = setTimeout(() => {
      document.body.classList.add("loaded");
      setIsLoaded(true);
    }, 2000);

    try {
      audioRef.current = new Audio("/bg.mp3");
      if (audioRef.current) {
        audioRef.current.volume = 0.15;
        audioRef.current.loop = true;
      }

    } catch (error) {
      console.error("Audio failed to initialize:", error);
    }

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      setCursorPosition({ x: clientX, y: clientY });
    };

    const handleMouseUp = () => {
      setCursorSize(20);
    };

    const playAudio = () => {
      audioRef.current?.play().catch(() => {
        console.log("Audio autoplay prevented - user must interact first");
      });
      document.removeEventListener("click", playAudio);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("click", playAudio);

    const moveZombies = () => {
      document.querySelectorAll<HTMLElement>(".zombie").forEach((zombie) => {
        const randomX = Math.random() * 10 - 5;
        const randomY = Math.random() * 10 - 5;
        
        let currentXVal = 0;
        let currentYVal = 0;
        
        const currentTransform = zombie.style.transform || "";
        const currentXMatch = /translateX\(([-\d.]+)px\)/.exec(currentTransform);
        const currentYMatch = /translateY\(([-\d.]+)px\)/.exec(currentTransform);
        
        if (currentXMatch) currentXVal = parseFloat(currentXMatch[1]);
        if (currentYMatch) currentYVal = parseFloat(currentYMatch[1]);
        
        const newX = Math.min(Math.max(currentXVal + randomX, -30), 30);
        const newY = Math.min(Math.max(currentYVal + randomY, -30), 30);
        
        zombie.style.transform = `translateX(${newX}px) translateY(${newY}px) rotate(${Math.random() * 6 - 3}deg)`;
      });
    };

    const zombieInterval = setInterval(moveZombies, 2500);

    return () => {
      clearTimeout(loadingSequence);
      clearInterval(zombieInterval);

      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("click", playAudio);

      if (audioRef.current) audioRef.current.pause();
    };
  }, []);
  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=no"
        />
      </Head>
      
      <div className="bg-black relative">
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
            <p className="text-toxic-green mt-8 animate-pulse loading-text ">
              Summoning the undead<span className="dot-1">.</span>
              <span className="dot-2">.</span>
              <span className="dot-3">.</span>
            </p>
          </div>
        ) : (
          <main className="relative">
            <section className="hero-section relative min-h-screen flex flex-col items-center justify-center py-16">
              <div className="parallax-container absolute inset-0 opacity-40 pointer-events-none">
                <div className="parallax-layer layer-1" data-speed="10"></div>
                <div className="parallax-layer layer-2" data-speed="20"></div>
                <div className="parallax-layer layer-3" data-speed="30"></div>
              </div>

              <div className="container mx-auto px-4 text-center relative">
                <div className="logo-container relative mx-auto mb-6">
                  <Image
                    src="/logo.png"
                    alt="Undead Courier"
                    width={700}
                    height={250}
                    className="mx-auto logo-glow new-logo-pulse"
                    priority
                    onError={(e) => { 
                      const target = e.target as HTMLImageElement;
                      target.src = "";
                    }}
                  />
                </div>

                <h2 className="tagline text-2xl md:text-3xl text-gray-300 mt-6 max-w-2xl mx-auto glitch-text ">
                  <span>
                    Ex-Army. One Last Mission. Deliver the secret cure before the world truly ends.
                  </span>
                </h2>
                <p className="text-gray-400 mt-4 max-w-xl mx-auto leading-relaxed text-lg px-4 ">
                  An asteroid brought the plague. The undead roam free. The only hope left? A top-secret
                  potion to end the infection. Arm up, soldier, you&apos;re humanity&apos;s final courier.
                </p>

                <div className="mt-12 flex flex-col md:flex-row justify-center items-center gap-6">
<a href="/download">
  <button
    className="play-button relative overflow-hidden"
    onMouseEnter={() => setIsHoveringButton(true)}
    onMouseLeave={() => setIsHoveringButton(false)}
  >
    <span className="relative z-10">PLAY NOW</span>
    <span className="button-glow"></span>
  </button>
  </a>

<a href="/trailer">
  <button
    className="trailer-button relative overflow-hidden"
    onMouseEnter={() => setIsHoveringButton(true)}
    onMouseLeave={() => setIsHoveringButton(false)}
  >
    <span className="relative z-10">WATCH TRAILER</span>
    <span className="trailer-button-glow"></span>
  </button>
  </a>
</div>
              </div>
              <div className="zombies-container absolute inset-0 overflow-hidden pointer-events-none">
                <div className="zombie zombie1" ref={zombieRef}></div>
                <div className="zombie zombie2"></div>
                <div className="zombie zombie3"></div>
              </div>
            </section>

            <section id="features" className="features-section py-24 relative bg-black">
              <div className="section-divider top"></div>

              <div className="container mx-auto px-4">
                <h2 className="section-title text-5xl md:text-6xl text-toxic-green text-center mb-20 animate-on-scroll ">
                  <span className="title-decoration">FEATURES</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <FeatureCard
                    index={1}
                    title="DELIVER THE CURE"
                    description="Brave undead hordes to deliver a world-saving potion. One bullet at a time, keep the package safe—humanity depends on it."
                    icon="/route.jpg"
                  />
                  <FeatureCard
                    index={2}
                    title="HIGH-POWERED ARSENAL"
                    description="Mow down zombies with shotguns, assault rifles, and advanced prototype weapons from your Army days. Over 30 ways to blow 'em to bits."
                    icon="/gun.png"
                  />
                  <FeatureCard
                    index={3}
                    title="FPS HORROR AT ITS FINEST"
                    description="Navigate terrifying districts under constant threat. Face cunning undead and mutated monstrosities in a race against time."
                    icon="/blood.png"
                  />
                </div>

                <div className="gameplay-showcase mt-32 animate-on-scroll">
                  <h3 className="text-3xl text-gray-300 mb-8 text-center ">
                    GAMEPLAY PREVIEW
                  </h3>

                  <div className="gameplay-video-container relative mx-auto max-w-5xl aspect-video border-4 border-zombie-green">
                    <div className="gameplay-placeholder flex items-center justify-center bg-fog-gray h-full">
                      <span className="text-toxic-green text-2xl animate-pulse ">
                        VIDEO COMING SOON
                      </span>
                    </div>
                    <div className="video-glitch-effect"></div>
                    <div className="corner-decoration top-left"></div>
                    <div className="corner-decoration top-right"></div>
                    <div className="corner-decoration bottom-left"></div>
                    <div className="corner-decoration bottom-right"></div>
                  </div>
                </div>

                <div className="mt-32 text-center animate-on-scroll">
                  <h3 className="text-3xl text-gray-300 mb-12 ">COMING SOON TO</h3>
                  <div className="platforms-container flex flex-wrap justify-center gap-12">
                    <PlatformIcon platform="Windows" />
                    <PlatformIcon platform="MacOS" />
                    <PlatformIcon platform="Linux" />
                  </div>
                </div>
              </div>

              <div className="section-divider bottom"></div>
            </section>
            <section id="world" className="world-section py-24 relative bg-black">
              <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                  <div className="animate-on-scroll">
                    <h2 className="text-4xl text-toxic-green mb-8 ">APOCALYPTIC WORLD</h2>
                    <p className="text-xl text-gray-300 mb-6 leading-relaxed ">
                      A rogue asteroid struck Earth, unleashing a viral plague that turned millions into
                      ravenous undead. Survivors cling to isolated enclaves, waiting for hope.
                    </p>
                    <p className="text-xl text-gray-300 mb-6 leading-relaxed ">
                      You&apos;re an ex-Army courier—immune to the virus—tasked with delivering a secret serum
                      to the last scientist who can reverse the infection. Twelve distinct districts,
                      each more treacherous than the last, stand between you and the cure.
                    </p>
                    <div className="stats-container mt-12 grid grid-cols-3 gap-4">
                      <div className="stat-item">
                        <div className="text-toxic-green text-4xl ">12</div>
                        <div className="text-gray-400 text-sm ">DISTRICTS</div>
                      </div>
                      <div className="stat-item">
                        <div className="text-toxic-green text-4xl ">30+</div>
                        <div className="text-gray-400 text-sm ">WEAPONS</div>
                      </div>
                      <div className="stat-item">
                        <div className="text-toxic-green text-4xl ">8</div>
                        <div className="text-gray-400 text-sm ">ZOMBIE TYPES</div>
                      </div>
                    </div>
                  </div>

                  <div className="world-image-container relative animate-on-scroll">
                    <div className="world-image aspect-square bg-fog-gray border-2 border-zombie-green relative overflow-hidden">
                      <Image
                        src=""
                        alt="Apocalyptic city"
                        width={600}
                        height={600}
                        className="world-image-placeholder"
                      />
                      <div className="image-scan-effect"></div>
                    </div>
                    <div className="world-image-decoration"></div>
                  </div>
                </div>
              </div>
            </section>

            <section id="newsletter" className="newsletter-section py-24 relative bg-black">
              <div className="section-divider top"></div>

              <div className="container mx-auto px-4 text-center">
                <h2 className="text-4xl text-toxic-green mb-8 animate-on-scroll ">
                  JOIN THE INFECTED
                </h2>
                <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-12 animate-on-scroll ">
                  Get exclusive updates, behind-the-scenes content, and the chance to join our closed beta
                  before launch. The cure can&apos;t wait—neither should you.
                </p>

                <form className="newsletter-form max-w-md mx-auto animate-on-scroll">
                  <div className="form-container relative">
                    <input
                      type="email"
                      placeholder="Your email"
                      className="newsletter-input bg-fog-gray border-2 border-zombie-green text-gray-200 px-6 py-4 rounded-sm w-full focus:outline-none focus:border-toxic-green "
                    />
                    <button
                      type="submit"
                      className="subscribe-button absolute right-0 top-0 bottom-0 bg-zombie-green hover:bg-toxic-green text-white text-xl px-6 "
                      onMouseEnter={() => setIsHoveringButton(true)}
                      onMouseLeave={() => setIsHoveringButton(false)}
                    >
                      INFECT ME
                    </button>
                  </div>
                </form>

              
              </div>

              <div className="section-divider bottom"></div>
            </section>

            <footer className="footer py-12 relative bg-black">
  <div className="container mx-auto px-4">
    <div className="footer-content">
      <div className="footer-logo">
        <Image
          src="/logo.png"
          alt="Undead Courier"
          width={200}
          height={70}
          className="opacity-70"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "";
          }}
        />
      </div>

      <div className="footer-links">
        <Link href="/" className="text-gray-400 hover:text-toxic-green transition">
          Home
        </Link>
        <a
          href="/download" 
          className="text-gray-400 hover:text-toxic-green transition"
        >
          Downloads
        </a>
        <a href="/leaderboard" className="text-gray-400 hover:text-toxic-green transition">
        Leaderboard
        </a>
      </div>

      <div className="footer-copyright">
        <p className="text-gray-600 text-sm">
          &copy; {new Date().getFullYear()} Undead Courier. All rights reserved.
        </p>
      </div>
    </div>
  </div>
</footer>
          </main>
        )}
      </div>
    </>
  );
}

function FeatureCard({
  index,
  title,
  description,
  icon,
}: FeatureCardProps) {
  return (
    <div
      className="feature-card bg-fog-gray border-2 border-zombie-green p-8 relative overflow-hidden animate-on-scroll hover:bg-gray-800 transition-colors duration-300"
      style={{ animationDelay: `${index * 200}ms` }}
    >
      <div className="feature-icon mb-6">
        <Image 
          src={icon || ""} 
          alt="" 
          width={60} 
          height={60}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "";
          }}
        />
      </div>
      <h3 className="text-2xl text-toxic-green mb-4 ">{title}</h3>
      <p className="text-gray-300 leading-relaxed ">{description}</p>
      <div className="feature-decoration"></div>
    </div>
  );
}

function PlatformIcon({ platform }: PlatformIconProps) {
  return (
    <div className="platform-icon relative hover:scale-110 transition-transform duration-300">
      <div className="platform-icon-inner flex flex-col items-center justify-center">
        <span className="platform-emoji text-4xl mb-1">
          {platform === "Linux"
            ? <FaLinux />
            : platform === "Windows"
            ? <FaWindows />
            : platform === "MacOS"
            ? <SiMacos />
            : "📱"}
        </span>
        <span className="platform-name text-toxic-green ">{platform}</span>
      </div>
      <div className="platform-glow"></div>
    </div>
  );
}
