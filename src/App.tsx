/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Gift, 
  Gamepad2, 
  MapPin, 
  ArrowLeft, 
  Coins, 
  Utensils, 
  Smile, 
  Car, 
  Coffee,
  Sparkles,
  Camera,
  Moon,
  Download,
  RefreshCw,
  Clock,
  Info,
  Pizza,
  Home,
  Flame,
  Film,
  Heart,
  BookOpen,
  Volume2,
  VolumeX,
  Play,
  Shirt,
  Star,
  Share2,
  Trash2,
  Plus,
  X,
  CheckCircle2,
  Music,
  ScrollText,
  ChevronLeft,
  ChevronRight,
  Bot,
  MessageSquare,
  HelpCircle,
  Maximize2
} from 'lucide-react';
import { 
  getAuth, 
  onAuthStateChanged, 
  User, 
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { auth, db, signInWithGoogle, handleFirestoreError, OperationType } from './firebase';
import { GoogleGenAI } from "@google/genai";
import confetti from 'canvas-confetti';
import EidJiggasa from './components/EidJiggasa';

import { EID_STORIES, EID_BOOKS } from './data/stories';

// --- Types ---
type Screen = 'entry' | 'splash' | 'menu' | 'salami' | 'game' | 'outing' | 'spin' | 'food' | 'selfie' | 'stories' | 'outfit' | 'ibadot' | 'about' | 'login';

// --- Helpers ---
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
  });
};

// --- Components ---

const BackgroundMusic = ({ isPlaying }: { isPlaying: boolean }) => {
  return (
    <div className="absolute top-0 left-0 w-1 h-1 opacity-0 pointer-events-none overflow-hidden">
      {isPlaying && (
        <iframe
          width="100"
          height="100"
          src="https://www.youtube.com/embed/R6ePrTGODHs?autoplay=1&mute=0&loop=1&playlist=R6ePrTGODHs&enablejsapi=1"
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        ></iframe>
      )}
    </div>
  );
};

const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [showFull, setShowFull] = useState(false);

  useEffect(() => {
    // Target: May 28, 2026, 00:00 AM BST (GMT+6)
    const targetDate = new Date('2026-05-28T00:00:00+06:00').getTime();

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatNum = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className="relative flex flex-col items-center justify-center">
      <span className="text-[7px] uppercase tracking-[0.15em] text-eid-gold/90 font-black mb-0.5 leading-none">Eid-ul-Adha</span>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowFull(!showFull)}
        className="flex items-center gap-1 bg-black/20 hover:bg-black/30 px-2 py-1 rounded-lg transition-colors border border-white/10"
      >
        <Clock size={10} className="text-eid-gold" />
        <div className="flex gap-0.5 font-mono text-[10px] font-bold text-eid-gold">
          <span>{formatNum(timeLeft.days)}</span>
          <span className="animate-pulse">:</span>
          <span>{formatNum(timeLeft.hours)}</span>
          <span className="animate-pulse">:</span>
          <span>{formatNum(timeLeft.minutes)}</span>
        </div>
      </motion.button>

      <AnimatePresence>
        {showFull && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-white text-eid-green p-3 rounded-xl shadow-xl border border-eid-gold/30 z-[60]"
          >
            <div className="flex items-start gap-2">
              <Info size={16} className="text-eid-gold shrink-0 mt-0.5" />
              <p className="text-xs font-bold bengali-text leading-relaxed">
                আর মাত্র <span className="text-eid-red">{timeLeft.days}</span> দিন পর ঈদ উল আযহা
              </p>
            </div>
            <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between text-[9px] font-medium text-gray-400 uppercase tracking-widest">
              <span>Days</span>
              <span>Hrs</span>
              <span>Min</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Header = ({ onBack, title, onSelfie, onTitleClick }: { onBack?: () => void; title: string; onSelfie?: () => void; onTitleClick?: () => void }) => (
  <header className="grid grid-cols-3 items-center px-4 py-3 bg-eid-green text-white sticky top-0 z-50 shadow-md">
    <div className="flex items-center gap-2">
      {onBack && (
        <button onClick={onBack} className="hover:bg-white/20 p-1.5 rounded-full transition-colors">
          <ArrowLeft size={20} />
        </button>
      )}
      <h1 
        onClick={onTitleClick}
        className={`text-sm font-bold tracking-tight truncate ${onTitleClick ? 'cursor-pointer hover:text-eid-gold transition-colors' : ''}`}
      >
        {title}
      </h1>
    </div>
    
    <div className="flex justify-center">
      <CountdownTimer />
    </div>

    <div className="flex justify-end">
      {onSelfie && (
        <button 
          onClick={onSelfie}
          className="flex items-center gap-1.5 bg-eid-gold/20 hover:bg-eid-gold/40 px-3 py-1.5 rounded-full transition-all border border-eid-gold/30"
        >
          <Camera size={18} className="text-eid-gold" />
          <span className="text-xs font-semibold hidden md:inline">Selfie</span>
        </button>
      )}
    </div>
  </header>
);

const SelfieScreen = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<'gold' | 'emerald' | 'royal'>('gold');

  useEffect(() => {
    if (!capturedImage) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [capturedImage]);

  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("আপনার ব্রাউজার ক্যামেরা সাপোর্ট করে না।");
      }
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' }, 
        audio: false 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraReady(true);
      }
    } catch (err) {
      console.error("Camera error:", err);
      setError("ক্যামেরা এক্সেস পাওয়া যায়নি বা ব্রাউজার সাপোর্ট করে না।");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw video frame (mirrored)
        context.save();
        context.scale(-1, 1);
        context.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
        context.restore();
        
        // Draw Overlays
        drawOverlays(context, canvas.width, canvas.height);
        
        setCapturedImage(canvas.toDataURL('image/png'));
        stopCamera();
      }
    }
  };

  const drawOverlays = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const themeColors = {
      gold: { primary: '#f59e0b', secondary: '#fbbf24', text: '#ffffff' },
      emerald: { primary: '#10b981', secondary: '#34d399', text: '#ffffff' },
      royal: { primary: '#6366f1', secondary: '#818cf8', text: '#ffffff' }
    };
    const colors = themeColors[theme];

    // 1. Decorative Frame (Corners)
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = width * 0.04;
    const cornerSize = width * 0.2;
    
    // Top Left
    ctx.beginPath();
    ctx.moveTo(0, cornerSize); ctx.lineTo(0, 0); ctx.lineTo(cornerSize, 0);
    ctx.stroke();
    
    // Top Right
    ctx.beginPath();
    ctx.moveTo(width - cornerSize, 0); ctx.lineTo(width, 0); ctx.lineTo(width, cornerSize);
    ctx.stroke();
    
    // Bottom Left
    ctx.beginPath();
    ctx.moveTo(0, height - cornerSize); ctx.lineTo(0, height); ctx.lineTo(cornerSize, height);
    ctx.stroke();
    
    // Bottom Right
    ctx.beginPath();
    ctx.moveTo(width - cornerSize, height); ctx.lineTo(width, height); ctx.lineTo(width, height - cornerSize);
    ctx.stroke();

    // 2. Mosque Silhouette at bottom
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    const mY = height * 0.85;
    ctx.moveTo(0, height);
    ctx.lineTo(0, mY);
    ctx.quadraticCurveTo(width * 0.1, mY - 40, width * 0.2, mY);
    ctx.lineTo(width * 0.3, mY);
    ctx.arc(width * 0.5, mY, width * 0.15, Math.PI, 0); // Dome
    ctx.lineTo(width * 0.7, mY);
    ctx.quadraticCurveTo(width * 0.9, mY - 40, width, mY);
    ctx.lineTo(width, height);
    ctx.fill();

    // 3. Moon & Star
    ctx.fillStyle = colors.secondary;
    ctx.font = `${width * 0.15}px serif`;
    ctx.fillText('🌙', width * 0.08, height * 0.15);
    ctx.font = `${width * 0.05}px serif`;
    ctx.fillText('⭐', width * 0.18, height * 0.1);

    // 4. Lanterns
    ctx.font = `${width * 0.1}px serif`;
    ctx.fillText('🏮', width * 0.82, height * 0.18);
    ctx.fillText('🏮', width * 0.72, height * 0.12);

    // 5. Festive Text
    ctx.fillStyle = colors.text;
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 15;
    ctx.font = `bold ${width * 0.1}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText('Eid Mubarak', width / 2, height * 0.88);
    
    ctx.font = `${width * 0.04}px Arial`;
    ctx.fillText('Celebration 2026', width / 2, height * 0.94);

    // 6. Floating Stars/Sparkles
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    for(let i = 0; i < 15; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height * 0.7;
      const size = Math.random() * 3 + 1;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const downloadImage = () => {
    if (capturedImage) {
      const link = document.createElement('a');
      link.href = capturedImage;
      link.download = `eid-selfie-${theme}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="flex flex-col items-center p-6 max-w-md mx-auto min-h-full">
      <div className="flex items-center justify-between w-full mb-4">
        <h2 className="text-xl font-bold text-eid-green bengali-text">ঈদ সেলফি কার্ড</h2>
        <div className="flex gap-2">
          {(['gold', 'emerald', 'royal'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`w-6 h-6 rounded-full border-2 transition-all ${
                theme === t ? 'border-eid-green scale-125' : 'border-transparent opacity-60'
              }`}
              style={{ backgroundColor: t === 'gold' ? '#f59e0b' : t === 'emerald' ? '#10b981' : '#6366f1' }}
            />
          ))}
        </div>
      </div>
      
      <div className="relative w-full aspect-[3/4] bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border-4 border-eid-green/20 group">
        {!capturedImage ? (
          <>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover"
              style={{ transform: 'scaleX(-1)' }}
            />
            {isCameraReady && (
              <div className="absolute inset-0 pointer-events-none p-4">
                {/* Live Preview Overlays */}
                <div className="flex justify-between items-start">
                  <div className="flex flex-col items-center">
                    <Moon className={theme === 'gold' ? 'text-eid-gold' : theme === 'emerald' ? 'text-emerald-400' : 'text-indigo-400'} size={40} />
                    <Sparkles className="text-white/60 animate-pulse" size={16} />
                  </div>
                  <div className="flex gap-2">
                    <div className="w-8 h-12 bg-eid-gold/40 rounded-b-full border border-eid-gold/60 flex items-center justify-center">
                      <span className="text-[10px]">🏮</span>
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-10 left-0 right-0 text-center">
                  <span className="text-white font-bold text-2xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Eid Mubarak</span>
                </div>
              </div>
            )}
            {!isCameraReady && !error && (
              <div className="absolute inset-0 flex items-center justify-center bg-eid-green/20 sm:bg-eid-green/10 sm:backdrop-blur-sm">
                <RefreshCw className="animate-spin text-eid-green" size={48} />
              </div>
            )}
            {error && (
              <div className="absolute inset-0 flex items-center justify-center p-6 text-center bg-red-50">
                <p className="text-red-600 font-medium">{error}</p>
              </div>
            )}
          </>
        ) : (
          <motion.img 
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            src={capturedImage} 
            alt="Captured" 
            className="w-full h-full object-cover" 
          />
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      <div className="mt-8 flex flex-col w-full gap-4">
        {!capturedImage ? (
          <button
            onClick={takePhoto}
            disabled={!isCameraReady}
            className="w-full bg-eid-green text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-eid-green/90 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Camera size={24} />
            ক্যাপচার করুন
          </button>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setCapturedImage(null)}
              className="bg-white text-gray-700 py-4 rounded-2xl font-bold shadow-md border border-gray-200 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw size={20} />
              আবার
            </button>
            <button
              onClick={downloadImage}
              className="bg-eid-gold text-eid-green py-4 rounded-2xl font-bold shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Download size={20} />
              সেভ
            </button>
          </div>
        )}
      </div>
      
      <div className="mt-6 p-4 bg-eid-gold/10 rounded-2xl border border-eid-gold/20">
        <p className="text-xs text-eid-green font-medium text-center italic">
          "থিম পরিবর্তন করে আপনার ঈদ কার্ডকে আরও আকর্ষণীয় করুন!"
        </p>
      </div>
    </div>
  );
};

const SalamiScreen = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-full p-6 text-center">
      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', damping: 12 }}
        className="relative mb-8"
      >
        {/* Bangladeshi 1000 Taka Note Mockup */}
        <div className="w-full max-w-[320px] aspect-[2/1] bg-purple-600 rounded-lg shadow-2xl border-4 border-purple-800 flex flex-col justify-between p-4 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/30 rounded-full -mr-8 -mt-8 sm:blur-xl blur-md" />
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold opacity-80 uppercase">Bangladesh Bank</span>
            <span className="text-xl font-black">১০০০</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-purple-700/50 flex items-center justify-center mb-1">
              <Sparkles size={32} className="text-eid-gold" />
            </div>
            <span className="text-[10px] opacity-70">এক হাজার টাকা</span>
          </div>
          <div className="flex justify-between items-end">
            <span className="text-xs font-mono">EID-2026-ADDA</span>
            <span className="text-lg font-bold">1000</span>
          </div>
        </div>
        <motion.div 
          animate={{ y: [0, -10, 0] }} 
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute -top-6 -right-6 bg-eid-gold text-eid-green p-3 rounded-full shadow-lg"
        >
          <Coins size={32} />
        </motion.div>
      </motion.div>
      <motion.h2 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-3xl font-bold text-eid-green mb-4 bengali-text"
      >
        এই নাও তোমার সালামি- তোমার ঈদ সুন্দর হোক
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-gray-600"
      >
        (ভার্চুয়াল সালামি দিয়ে চা খেয়ে নিও! ☕)
      </motion.p>
    </div>
  );
};

const SemaiGame = () => {
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [isEating, setIsEating] = useState(false);
  const [missedCount, setMissedCount] = useState(0);
  const [feedback, setFeedback] = useState<{ text: string; id: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const [playerPosition, setPlayerPosition] = useState(50); // Percentage
  const playerPosRef = useRef(50);
  const [items, setItems] = useState<{ id: number; x: number; y: number; type: 'semai' | 'money' }[]>([]);
  
  const gameLoopRef = useRef<number | null>(null);
  const lastSpawnRef = useRef<number>(0);

  const feedbackMessages = ['ওহ হো', 'টাকা আর টাকা', 'ইয়ামি', 'ঈদ মুবারাক', 'মজার সেমাই', 'দারুন খেতে'];

  const startGame = () => {
    setScore(0);
    setGameOver(false);
    setGameStarted(true);
    setItems([]);
    setIsEating(false);
    setMissedCount(0);
    setFeedback(null);
    lastSpawnRef.current = Date.now();
  };

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const update = () => {
      const now = Date.now();
      
      // Spawn items
      if (now - lastSpawnRef.current > 600) {
        const newItem: { id: number; x: number; y: number; type: 'semai' | 'money' } = {
          id: now,
          x: Math.random() * 90 + 5,
          y: -10,
          type: Math.random() > 0.3 ? 'semai' : 'money'
        };
        setItems(prev => [...prev, newItem]);
        lastSpawnRef.current = now;
      }

      // Move items
      setItems(prev => {
        const nextItems = prev.map(item => ({ ...item, y: item.y + 0.8 } as typeof item));
        
        let caughtCount = 0;
        let missedSemai = false;

        // Collision detection
        const caught = nextItems.filter(item => {
          const isCaught = item.y > 80 && item.y < 90 && Math.abs(item.x - playerPosRef.current) < 12;
          if (isCaught) {
            setScore(s => s + (item.type === 'money' ? 50 : 10));
            
            // Random feedback
            const randomMsg = feedbackMessages[Math.floor(Math.random() * feedbackMessages.length)];
            setFeedback({ text: randomMsg, id: Date.now() });

            if (item.type === 'semai') {
              setIsEating(true);
              // setMissedCount(0); // Removed: User wants total 3 misses, not consecutive
              setTimeout(() => setIsEating(false), 400);
            }
          }
          return isCaught;
        });

        // Detect missed semai
        nextItems.forEach(item => {
          if (item.y >= 100 && item.type === 'semai') {
            missedSemai = true;
          }
        });

        if (missedSemai) {
          setMissedCount(m => {
            const newCount = m + 1;
            if (newCount >= 3) {
              setGameOver(true);
            }
            return newCount;
          });
        }

        // Filter out caught or missed items
        const remaining = nextItems.filter(item => item.y < 100 && !caught.includes(item));
        
        return remaining;
      });

      gameLoopRef.current = requestAnimationFrame(update);
    };

    gameLoopRef.current = requestAnimationFrame(update);
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [gameStarted, gameOver]);

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const x = ((clientX - rect.left) / rect.width) * 100;
    const newPos = Math.max(5, Math.min(95, x));
    setPlayerPosition(newPos);
    playerPosRef.current = newPos;
  };

  return (
    <div className="flex flex-col items-center p-4 max-w-md mx-auto min-h-full">
      <div className="mb-4 text-center">
        <h2 className="text-2xl font-bold text-eid-green bengali-text">সেমাই খাও লুপে নাও</h2>
        <p className="text-sm text-gray-600">সেমাই খাও আর সালামি জমাও!</p>
        <div className="flex items-center justify-center gap-4 mt-2">
          <div className="text-2xl font-black text-eid-red">৳ {score}</div>
          <div className="flex gap-1">
            {[...Array(3)].map((_, i) => (
              <div 
                key={i} 
                className={`w-3 h-3 rounded-full border border-eid-red ${i < missedCount ? 'bg-eid-red' : 'bg-transparent'}`} 
              />
            ))}
          </div>
        </div>
      </div>

      <div 
        ref={containerRef}
        className="relative w-full aspect-[3/4] bg-eid-cream border-4 border-eid-green rounded-2xl overflow-hidden cursor-none touch-none shadow-inner"
        onMouseMove={handleMouseMove}
        onTouchMove={handleMouseMove}
      >
        {!gameStarted ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 sm:bg-black/40 sm:backdrop-blur-sm z-10 p-6 text-center">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white/95 p-6 rounded-3xl shadow-2xl border-2 border-eid-gold max-w-[280px]"
            >
              <h3 className="text-xl font-bold text-eid-green mb-3 bengali-text">কিভাবে খেলবেন?</h3>
              <ul className="text-sm text-gray-700 space-y-2 mb-6 text-left bengali-text">
                <li className="flex items-start gap-2">
                  <span className="text-eid-gold">⭐</span>
                  <span>মাউস বা আঙুল দিয়ে বাটিটি ডানে-বামে সরাও।</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-eid-gold">⭐</span>
                  <span>সেমাই খেলে ১০ পয়েন্ট এবং সালামি (টাকা) পেলে ৫০ পয়েন্ট পাবে।</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-eid-red font-bold">⭐</span>
                  <span>সতর্কতা: মোট ৩টি সেমাই মিস করলেই গেইম ওভার হবে!</span>
                </li>
              </ul>
              <button 
                onClick={startGame}
                className="w-full bg-eid-gold text-eid-green py-3 rounded-2xl font-bold text-lg shadow-lg hover:scale-105 transition-transform bengali-text"
              >
                খেলা শুরু করো
              </button>
            </motion.div>
          </div>
        ) : gameOver ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 sm:bg-black/60 sm:backdrop-blur-md z-20 p-6 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white p-8 rounded-[40px] shadow-2xl border-4 border-eid-gold"
            >
              <h3 className="text-3xl font-black text-eid-red mb-2 bengali-text">গেইম ওভার!</h3>
              <p className="text-gray-600 mb-6 bengali-text">আপনি মোট ৩টি সেমাই মিস করেছেন</p>
              
              <div className="bg-eid-cream p-6 rounded-3xl mb-8 border-2 border-eid-gold/30">
                <div className="text-sm text-eid-green font-bold uppercase tracking-widest mb-1">মোট সালামি জমা হয়েছে</div>
                <div className="text-5xl font-black text-eid-green">৳ {score}</div>
              </div>

              <button 
                onClick={startGame}
                className="w-full bg-eid-green text-white py-4 rounded-2xl font-bold text-xl shadow-lg hover:scale-105 transition-transform flex items-center justify-center gap-2 bengali-text"
              >
                <RefreshCw size={24} />
                আবার খেলুন
              </button>
            </motion.div>
          </div>
        ) : (
          <>
            {/* Items */}
            {items.map(item => (
              <div 
                key={item.id}
                className="absolute"
                style={{ left: `${item.x}%`, top: `${item.y}%`, transform: 'translate(-50%, -50%)' }}
              >
                {item.type === 'semai' ? (
                  <div className="bg-white p-2 rounded-full shadow-md">
                    <Utensils size={24} className="text-amber-600" />
                  </div>
                ) : (
                  <div className="bg-green-500 p-2 rounded-full shadow-md animate-bounce">
                    <Coins size={24} className="text-white" />
                  </div>
                )}
              </div>
            ))}

            {/* Player */}
            <div 
              ref={playerRef}
              className="absolute bottom-4"
              style={{ left: `${playerPosition}%`, transform: 'translateX(-50%)' }}
            >
              <div className="relative flex flex-col items-center">
                {/* Feedback Message */}
                <AnimatePresence>
                  {feedback && (
                    <motion.div
                      key={feedback.id}
                      initial={{ opacity: 0, y: 0, scale: 0.5 }}
                      animate={{ opacity: 1, y: -60, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute -top-12 whitespace-nowrap bg-white/90 px-3 py-1 rounded-full shadow-sm border border-eid-gold text-eid-green font-bold text-sm z-30 bengali-text"
                    >
                      {feedback.text}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Bowl (Bati) */}
                <motion.div 
                  animate={isEating ? { y: [0, 5, 0], scale: [1, 1.1, 1] } : {}}
                  className="w-20 h-10 bg-eid-gold rounded-b-3xl border-x-2 border-b-2 border-eid-green relative z-20 shadow-md"
                >
                  <div className="absolute -top-2 left-0 w-full h-4 bg-white/60 rounded-full border-2 border-eid-green flex items-center justify-center overflow-hidden">
                    <div className="w-full h-full bg-amber-100/50" />
                  </div>
                </motion.div>
                
                {/* Character */}
                <motion.div 
                  animate={isEating ? { scale: [1, 1.1, 1] } : {}}
                  className="w-16 h-16 bg-eid-red rounded-full flex items-center justify-center shadow-lg border-2 border-white -mt-4 relative z-10"
                >
                  <Smile size={40} className="text-white" />
                  {isEating && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute bottom-3 w-6 h-4 bg-black rounded-full" 
                    />
                  )}
                </motion.div>
              </div>
            </div>
          </>
        )}
      </div>
      
      <div className="mt-6 text-center text-gray-500 text-xs italic">
        মাউস বা আঙুল দিয়ে ডানে-বামে সরাও
      </div>
    </div>
  );
};

const OutingScreen = () => {
  const [budget, setBudget] = useState<string>('');
  const [result, setResult] = useState<string | null>(null);

  const handleCheck = () => {
    const b = parseInt(budget);
    if (isNaN(b)) return;

    if (b >= 0 && b <= 100) {
      setResult('কিরে ভাই!🤣 তুমি তো গরিব! এই বাজেট এ কোথাও না ঘুরে বাড়ির পাশের টং দোকান থেকে চা-বিস্কুট খেয়ে আসো');
    } else if (b >= 101 && b <= 200) {
      setResult('ভাই ! তোমার যেই বাজেট এটা দেখে মনে হইতেছে তোমারে কেউ পাত্তা দেয় না🤣');
    } else if (b >= 201 && b <= 400) {
      setResult('টাকার পরিমাণ যদিও কম তবুও এই টাকা দিয়ে আসে পাশে কোন পার্ক থাকলে ঘুরে আসো🙂');
    } else if (b >= 401 && b <= 500) {
      setResult('ভাই ভালোই!! এই টাকা দিয়ে নানার বাড়ি/খালার বাড়ি ঘুরে আসো, মামাতো,খালাতো বোনকে সালামি দিয়ে আসো বা নিয়ে আসো☺️');
    } else if (b >= 501 && b <= 800) {
      setResult('ওয়েলডান !! কাচ্চিডাইন চলো ,কাচ্চি খাবো😋');
    } else if (b >= 801 && b <= 999) {
      setResult('বস !! তুমি তোমার প্রিয়জন কে নিয়ে পার্ক এ যাও , সাথে আমাকেও নিও');
    } else if (b >= 1000 && b <= 1200) {
      setResult('বাহ! ভাই বাহ!! পিৎজাবার্গ এর যাবা? তোমার না ফেবারেট?😉');
    } else if (b >= 1201 && b <= 1500) {
      setResult('শ্বশুরবাড়ি আছে? থাকলে ঘুরে আসো। শালাশালিরে সালামি দিও');
    } else if (b >= 1501 && b <= 2000) {
      setResult('রাজমহলে আসো আমরা বারবি-কিউ পার্টি দিবো। তোমার কাছে তোমার ভালোই টাকা আছে');
    } else if (b >= 2001 && b <= 2999) {
      setResult('বস !! তুমি তোমার প্রিয়জন কে নিয়ে পার্ক এ যাও , সাথে আমাকেও নিও');
    } else if (b >= 3000 && b <= 4000) {
      setResult('ব্রো সিনেমা দেখে আসো ! তোমার পছন্দের নায়কের😎');
    } else if (b >= 4001 && b < 7000) {
      setResult('তোমার কাছে তো অনেক টাকা , তুমি আমাকে নিয়ে চল আমরা লং ড্রাইভ এ যায়😊');
    } else if (b >= 7000) {
      setResult('অনেক টাকা আছে তোমার কাছে , এই টাকা দিয়ে বিয়ে করে নাও আর কতো সিঙ্গেল থাকবা , হুমমম😒');
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto min-h-full flex flex-col items-center justify-center">
      <AnimatePresence mode="wait">
        {!result ? (
          <motion.div 
            key="input"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full space-y-6 text-center"
          >
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-eid-gold/20">
              <MapPin size={48} className="mx-auto text-eid-red mb-4" />
              <h2 className="text-xl font-bold text-eid-green mb-6 bengali-text">
                তোমার ঈদ বাজেট বলো আমি তোমার ঘুরার জায়গা বলছি
              </h2>
              <input 
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="বাজেট লিখুন (৳)"
                className="w-full p-4 bg-gray-50 border-2 border-eid-green rounded-2xl text-center text-2xl font-bold text-eid-green focus:outline-none focus:ring-4 focus:ring-eid-green/20 transition-all placeholder:text-gray-400"
              />
              <button 
                onClick={handleCheck}
                disabled={!budget}
                className="w-full mt-6 bg-eid-green text-white py-4 rounded-2xl font-bold text-lg hover:bg-eid-green/90 transition-colors disabled:opacity-50 bengali-text"
              >
                জায়গা খুঁজে দাও
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="result"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full text-center"
          >
            <div className="bg-eid-green text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full sm:blur-3xl blur-lg" />
              
              {parseInt(budget) <= 100 && <Coffee size={64} className="mx-auto mb-6 text-eid-gold" />}
              {parseInt(budget) > 100 && parseInt(budget) <= 200 && <Smile size={64} className="mx-auto mb-6 text-eid-gold" />}
              {parseInt(budget) > 200 && parseInt(budget) <= 400 && <MapPin size={64} className="mx-auto mb-6 text-eid-gold" />}
              {parseInt(budget) > 400 && parseInt(budget) <= 500 && <Gift size={64} className="mx-auto mb-6 text-eid-gold" />}
              {parseInt(budget) > 500 && parseInt(budget) <= 800 && <Utensils size={64} className="mx-auto mb-6 text-eid-gold" />}
              {parseInt(budget) > 800 && parseInt(budget) <= 999 && <Smile size={64} className="mx-auto mb-6 text-eid-gold" />}
              {parseInt(budget) >= 1000 && parseInt(budget) <= 1200 && <Pizza size={64} className="mx-auto mb-6 text-eid-gold" />}
              {parseInt(budget) >= 1201 && parseInt(budget) <= 1500 && <Home size={64} className="mx-auto mb-6 text-eid-gold" />}
              {parseInt(budget) >= 1501 && parseInt(budget) <= 2000 && <Flame size={64} className="mx-auto mb-6 text-eid-gold" />}
              {parseInt(budget) >= 2001 && parseInt(budget) <= 2999 && <Smile size={64} className="mx-auto mb-6 text-eid-gold" />}
              {parseInt(budget) >= 3000 && parseInt(budget) <= 4000 && <Film size={64} className="mx-auto mb-6 text-eid-gold" />}
              {parseInt(budget) >= 4001 && parseInt(budget) < 7000 && <Car size={64} className="mx-auto mb-6 text-eid-gold" />}
              {parseInt(budget) >= 7000 && <Heart size={64} className="mx-auto mb-6 text-eid-gold" />}

              <h3 className="text-2xl font-bold leading-relaxed bengali-text">
                {result}
              </h3>
              
              <button 
                onClick={() => {setResult(null); setBudget('');}}
                className="mt-8 bg-white text-eid-green px-6 py-2 rounded-full font-bold text-sm hover:bg-eid-gold transition-colors bengali-text"
              >
                আবার বাজেট দাও
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SpinWheelScreen = () => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const segments = [
    { text: '১০ টাকা', color: '#10b981' }, // Green
    { text: '৫০ টাকা', color: '#f59e0b' }, // Gold/Amber
    { text: '১০০ টাকা', color: '#ef4444' }, // Red
    { text: '৫০০ টাকা', color: '#8b5cf6' }, // Purple
    { text: '১০০০ টাকা', color: '#3b82f6' }, // Blue
    { text: 'দুঃখিত আবার ঘুরাও 😆', color: '#6b7280' }, // Gray
  ];

  const spin = () => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    setResult(null);
    
    const extraSpins = 5 + Math.floor(Math.random() * 5);
    const randomSegment = Math.floor(Math.random() * segments.length);
    const segmentAngle = 360 / segments.length;
    const targetRotation = rotation + (extraSpins * 360) + (randomSegment * segmentAngle);
    
    setRotation(targetRotation);
    
    setTimeout(() => {
      setIsSpinning(false);
      // The indicator is at the top (0 degrees). 
      // Rotation is clockwise.
      // So the segment at the top is (totalRotation % 360)
      // But we need to account for the fact that the wheel rotates, 
      // and the segments are laid out counter-clockwise in the SVG if we use standard angles.
      // Actually, let's just calculate which index landed at the top.
      const finalAngle = targetRotation % 360;
      const index = Math.floor(((360 - finalAngle + (segmentAngle / 2)) % 360) / segmentAngle);
      setResult(segments[index].text);
    }, 4000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-full p-6 text-center">
      <h2 className="text-3xl font-bold text-eid-green mb-8 bengali-text">সালামি স্পিন হুইল</h2>
      
      <div className="relative w-72 h-72 mb-12">
        {/* Pointer */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 w-8 h-8 bg-eid-red shadow-lg" style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }} />
        
        {/* Wheel */}
        <motion.div
          animate={{ rotate: rotation }}
          transition={{ duration: 4, ease: [0.45, 0.05, 0.55, 0.95] }}
          className="w-full h-full rounded-full border-8 border-eid-green shadow-2xl overflow-hidden relative"
        >
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {segments.map((seg, i) => {
              const angle = 360 / segments.length;
              const startAngle = i * angle;
              const endAngle = (i + 1) * angle;
              
              // SVG arc path
              const x1 = 50 + 50 * Math.cos((Math.PI * (startAngle - 90)) / 180);
              const y1 = 50 + 50 * Math.sin((Math.PI * (startAngle - 90)) / 180);
              const x2 = 50 + 50 * Math.cos((Math.PI * (endAngle - 90)) / 180);
              const y2 = 50 + 50 * Math.sin((Math.PI * (endAngle - 90)) / 180);
              
              return (
                <g key={i}>
                  <path
                    d={`M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`}
                    fill={seg.color}
                    stroke="white"
                    strokeWidth="0.5"
                  />
                  <text
                    x="50"
                    y="20"
                    transform={`rotate(${startAngle + angle / 2}, 50, 50)`}
                    fill="white"
                    fontSize="4"
                    fontWeight="bold"
                    textAnchor="middle"
                    className="bengali-text"
                  >
                    {seg.text}
                  </text>
                </g>
              );
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 bg-white rounded-full border-4 border-eid-green shadow-inner z-10 flex items-center justify-center">
              <Sparkles className="text-eid-gold" size={24} />
            </div>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="mb-8 p-6 bg-white rounded-3xl shadow-xl border-2 border-eid-gold"
          >
            <p className="text-gray-500 text-sm mb-2">অভিনন্দন! তুমি পেয়েছো:</p>
            <h3 className="text-3xl font-black text-eid-green bengali-text">{result}</h3>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={spin}
        disabled={isSpinning}
        className={`px-12 py-4 rounded-full font-bold text-xl shadow-lg transition-all bengali-text ${
          isSpinning 
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
            : 'bg-eid-gold text-eid-green hover:scale-105 active:scale-95'
        }`}
      >
        {isSpinning ? 'ঘুরছে...' : 'স্পিন করো'}
      </button>
    </div>
  );
};

const StoriesScreen = () => {
  const [activeTab, setActiveTab] = useState<'stories' | 'books'>('stories');
  const [selectedItem, setSelectedItem] = useState<{ title: string; content: string } | null>(null);

  return (
    <div className="p-6 max-w-md mx-auto min-h-full">
      <div className="flex bg-eid-gold/10 p-1 rounded-2xl mb-6 border border-eid-gold/20">
        <button 
          onClick={() => { setActiveTab('stories'); setSelectedItem(null); }}
          className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'stories' ? 'bg-eid-green text-white shadow-lg' : 'text-eid-green'}`}
        >
          গল্প (Stories)
        </button>
        <button 
          onClick={() => { setActiveTab('books'); setSelectedItem(null); }}
          className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'books' ? 'bg-eid-green text-white shadow-lg' : 'text-eid-green'}`}
        >
          বই (Books)
        </button>
      </div>

      <AnimatePresence mode="wait">
        {selectedItem ? (
          <motion.div
            key="detail"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white p-8 rounded-3xl shadow-xl border-2 border-eid-gold/20"
          >
            <h3 className="text-2xl font-bold text-eid-green mb-6 bengali-text border-b pb-4 border-eid-gold/20">
              {selectedItem.title}
            </h3>
            <p className="text-lg text-gray-700 leading-relaxed bengali-text mb-8 text-justify">
              {selectedItem.content}
            </p>
            <button
              onClick={() => setSelectedItem(null)}
              className="w-full bg-eid-green text-white py-4 rounded-2xl font-bold hover:bg-eid-green/90 transition-colors bengali-text"
            >
              তালিকায় ফিরে যান
            </button>
          </motion.div>
        ) : activeTab === 'stories' ? (
          <motion.div
            key="stories-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 gap-4"
          >
            <div className="text-center mb-4">
              <BookOpen size={40} className="mx-auto text-eid-gold mb-2" />
              <h2 className="text-xl font-bold text-eid-green bengali-text">ঈদের সেরা গল্প</h2>
              <p className="text-xs text-gray-500">আপনার প্রিয় গল্পটি পড়তে ক্লিক করুন</p>
            </div>
            {EID_STORIES.map((story, index) => (
              <motion.div
                key={index}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: Math.min(index * 0.05, 1) }}
                onClick={() => setSelectedItem(story)}
                className="bg-white p-5 rounded-2xl shadow-md border border-eid-gold/10 hover:border-eid-gold cursor-pointer transition-all flex items-center gap-4 group"
              >
                <div className="w-12 h-12 bg-eid-gold/10 rounded-2xl flex items-center justify-center text-eid-gold font-bold group-hover:bg-eid-gold group-hover:text-white transition-colors">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-eid-green bengali-text text-sm">{story.title}</h3>
                  <p className="text-[10px] text-gray-400 truncate w-40">গল্পটি পড়তে এখানে ক্লিক করুন...</p>
                </div>
                <ChevronRight size={18} className="text-gray-300" />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="books-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 gap-4"
          >
            <div className="text-center mb-4">
              <ScrollText size={40} className="mx-auto text-eid-gold mb-2" />
              <h2 className="text-xl font-bold text-eid-green bengali-text">ঈদের বইয়ের তালিকা</h2>
              <p className="text-xs text-gray-500">ঈদের ছুটিতে পড়ার জন্য কিছু সেরা বই (ক্লিক করে পড়ুন)</p>
            </div>
            {EID_BOOKS.map((book, index) => (
              <motion.div
                key={index}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedItem({ title: book.title, content: book.content })}
                className="bg-white p-5 rounded-2xl shadow-md border border-eid-gold/10 hover:border-eid-gold cursor-pointer transition-all flex items-start gap-4"
              >
                <div className="w-12 h-12 bg-eid-green/10 rounded-2xl flex items-center justify-center text-eid-green shrink-0">
                  <BookOpen size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-eid-green bengali-text">{book.title}</h3>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{book.description}</p>
                </div>
                <ChevronRight size={18} className="text-gray-300 self-center" />
              </motion.div>
            ))}
            <div className="mt-6 p-4 bg-eid-gold/10 rounded-2xl border border-eid-gold/20 text-center">
              <p className="text-xs text-eid-green font-medium italic">
                "বই পড়ার আনন্দই আলাদা, বিশেষ করে ঈদের ছুটিতে!"
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FoodScreen = () => {
  const [selectedFood, setSelectedFood] = useState<{ name: string; fact: string; emoji: string } | null>(null);
  
  const foodList = [
    { name: 'সেমাই', fact: 'ঈদের সকাল মানেই সেমাই! 🥣', emoji: '🥣' },
    { name: 'বিরিয়ানি', fact: 'বিরিয়ানি ছাড়া ঈদ? অসম্ভব! 🍛', emoji: '🍛' },
    { name: 'কাবাব', fact: 'গরম গরম কাবাব, আহা! 🍢', emoji: '🍢' },
    { name: 'ফিরনি', fact: 'মিষ্টি মুখের সেরা তৃপ্তি। 🍮', emoji: '🍮' },
    { name: 'পিজা', fact: 'আধুনিক ঈদের আধুনিক খাবার! 🍕', emoji: '🍕' },
    { name: 'চা', fact: 'আড্ডার প্রাণ হলো এক কাপ চা। ☕', emoji: '☕' },
    { name: 'মাংস-পোলাউ', fact: 'মায়ের হাতের সেরা রান্না। 🍚', emoji: '🍚' },
    { name: 'চটপটি', fact: 'বিকেলের নাস্তায় চটপটি মাস্ট! 🥣', emoji: '🥣' },
    { name: 'হালিম', fact: 'মজাদার হালিম, জিভে জল আসে! 🍲', emoji: '🍲' },
    { name: 'আইচ-ক্রিম', fact: 'গরমের ঈদে একটু ঠান্ডা শান্তি। 🍦', emoji: '🍦' },
    { name: 'বার-বি-কিউ', fact: 'রাতের আড্ডায় বার-বি-কিউ পার্টি! 🍗', emoji: '🍗' },
    { name: 'ন্যুডলস', fact: 'বাচ্চাদের প্রিয় ন্যুডলস। 🍜', emoji: '🍜' },
    { name: 'পায়েস', fact: 'ঐতিহ্যবাহী মিষ্টি খাবার। 🥣', emoji: '🥣' },
    { name: 'কোক', fact: 'ভারী খাবারের পর একটু কোক! 🥤', emoji: '🥤' },
    { name: 'খিচুড়ি', fact: 'বৃষ্টির দিনে বা সকালে খিচুড়ি। 🍛', emoji: '🍛' },
    { name: 'বার্গার', fact: 'বন্ধুদের সাথে বার্গার আড্ডা। 🍔', emoji: '🍔' },
  ];

  return (
    <div className="p-6 max-w-md mx-auto min-h-full">
      <h2 className="text-3xl font-bold text-eid-green mb-6 text-center bengali-text">ঈদ খাবার লিস্ট</h2>
      <p className="text-center text-gray-500 mb-8 bengali-text">খাবারের নাম এ ক্লিক করো মজার তথ্য জানতে!</p>
      
      <div className="grid grid-cols-2 gap-4">
        {foodList.map((food, index) => (
          <motion.button
            key={index}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedFood(food)}
            className="bg-white p-4 rounded-2xl shadow-md border-2 border-transparent hover:border-eid-gold transition-all flex flex-col items-center gap-2"
          >
            <span className="text-3xl">{food.emoji}</span>
            <span className="font-bold text-eid-green bengali-text">{food.name}</span>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {selectedFood && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedFood(null)}
            className="absolute inset-0 z-[110] flex items-center justify-center bg-black/80 sm:bg-black/60 p-6 sm:backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white p-8 rounded-[40px] shadow-2xl text-center max-w-sm border-4 border-eid-gold relative"
            >
              <button 
                onClick={() => setSelectedFood(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-eid-red"
              >
                <Smile size={24} />
              </button>
              <div className="text-6xl mb-4 animate-bounce">{selectedFood.emoji}</div>
              <h3 className="text-2xl font-black text-eid-green mb-4 bengali-text">{selectedFood.name}</h3>
              <p className="text-lg text-gray-700 bengali-text leading-relaxed">
                {selectedFood.fact}
              </p>
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="mt-6 inline-block"
              >
                <Utensils size={32} className="text-eid-gold" />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const OutfitRatingScreen = () => {
  const [images, setImages] = useState<{ 
    file: File; 
    preview: string; 
    rating?: number; 
    feedback?: string; 
    estimatedPrice?: string;
    priceAdvice?: string;
    materialDetails?: string;
    loading?: boolean 
  }[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getRatingInfo = (rating: number) => {
    if (rating >= 9.5) return { emoji: "👑", text: "রাজকীয়!", color: "text-yellow-500", animation: "animate-bounce" };
    if (rating >= 9.0) return { emoji: "🔥", text: "অসাধারণ!", color: "text-orange-500", animation: "animate-pulse" };
    if (rating >= 8.0) return { emoji: "😍", text: "দারুণ!", color: "text-pink-500", animation: "animate-bounce" };
    if (rating >= 7.0) return { emoji: "✨", text: "সুন্দর!", color: "text-eid-gold", animation: "animate-pulse" };
    return { emoji: "🙂", text: "ভালো!", color: "text-eid-green", animation: "" };
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files) {
      const newFiles = Array.from(e.target.files) as File[];
      const remainingSlots = 1 - images.length;
      const filesToAdd = newFiles.slice(0, remainingSlots);

      const newImages = filesToAdd.map(file => ({
        file,
        preview: URL.createObjectURL(file),
        loading: false
      }));

      setImages(prev => [...prev, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return newImages;
    });
    setError(null);
  };

  const analyzeOutfits = async () => {
    if (images.length === 0) return;
    setIsAnalyzing(true);
    setError(null);

    // Robust way to access the API key in a Vite environment
    let apiKey = '';
    try {
      // @ts-ignore
      apiKey = (typeof process !== 'undefined' && process.env ? process.env.GEMINI_API_KEY : '') || 
               // @ts-ignore
               (import.meta.env ? import.meta.env.VITE_GEMINI_API_KEY : '');
    } catch (e) {
      console.error("Error accessing API key:", e);
    }
    
    if (!apiKey || apiKey === "undefined" || apiKey === "null" || apiKey.includes("TODO")) {
      setError("এআই সার্ভিসটি বর্তমানে কনফিগার করা নেই। অনুগ্রহ করে সেটিংস থেকে GEMINI_API_KEY সেট করুন।");
      setIsAnalyzing(false);
      return;
    }

    const updatedImages = [...images];

    for (let i = 0; i < updatedImages.length; i++) {
      if (updatedImages[i].rating) continue;

      updatedImages[i] = { ...updatedImages[i], loading: true };
      setImages([...updatedImages]);

      try {
        // Create instance right before use
        const ai = new GoogleGenAI({ apiKey });
        
        const base64Data = await fileToBase64(updatedImages[i].file);
        
        // Simplified prompt for better reliability
        const prompt = `Analyze this Eid outfit photo. 
        Return a JSON object with:
        1. "rating": a number between 5.0 and 10.0
        2. "feedback": a short, friendly compliment in Bengali about the style/color.
        3. "estimatedPrice": Guess the price in BDT (e.g., "৳২,৫০০ - ৳৩,৫০০").
        4. "priceAdvice": Advice on what would be a fair price for this outfit (in Bengali).
        5. "materialDetails": Detail about the material and why the price is estimated as such (in Bengali).
        
        Example: {
          "rating": 9.2, 
          "feedback": "চমৎকার পাঞ্জাবি, রঙটা আপনাকে খুব মানিয়েছে!",
          "estimatedPrice": "৳২,৫০০ - ৳৩,৫০০",
          "priceAdvice": "এই মানের কাপড়ের জন্য ৩০০০ টাকার আশেপাশে দাম হওয়া উচিত।",
          "materialDetails": "এটি উন্নত মানের সুতি কাপড় মনে হচ্ছে, যার কারুকাজ বেশ নিখুঁত।"
        }`;

        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: {
            parts: [
              { inlineData: { data: base64Data, mimeType: updatedImages[i].file.type } },
              { text: prompt }
            ]
          },
          config: { 
            responseMimeType: "application/json",
            temperature: 0.7
          }
        });

        const text = response.text;
        if (!text) {
          throw new Error("এআই থেকে কোনো রেসপন্স পাওয়া যায়নি।");
        }

        let result;
        try {
          result = JSON.parse(text);
        } catch (parseErr) {
          console.error("JSON Parse Error:", text);
          // Fallback if JSON parsing fails but we have text
          result = { rating: 8.5, feedback: "আপনার আউটফিটটি খুব সুন্দর!" };
        }

        const rating = result.rating || 8.5;
        
        if (rating >= 9.0) {
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#D4AF37', '#1B4D3E', '#FF0000']
          });
        }

        updatedImages[i] = { 
          ...updatedImages[i], 
          rating: rating, 
          feedback: result.feedback || "চমৎকার আউটফিট!",
          estimatedPrice: result.estimatedPrice || "৳১,৫০০ - ৳২,৫০০",
          priceAdvice: result.priceAdvice || "বাজার দর অনুযায়ী দাম ঠিক আছে।",
          materialDetails: result.materialDetails || "কাপড়ের মান বেশ ভালো মনে হচ্ছে।",
          loading: false 
        };
        setImages([...updatedImages]);
      } catch (err: any) {
        console.error("Analysis error details:", err);
        
        let userFriendlyError = "এআই বিশ্লেষণ করতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।";
        
        const errorStr = String(err);
        if (errorStr.includes("API key not valid") || errorStr.includes("INVALID_ARGUMENT") || errorStr.includes("400")) {
          userFriendlyError = "আপনার এআই কী (API Key) সঠিক নয়। অনুগ্রহ করে সেটিংস থেকে সঠিক GEMINI_API_KEY সেট করুন।";
        } else if (errorStr.includes("Quota exceeded") || errorStr.includes("429")) {
          userFriendlyError = "আজকের ফ্রি লিমিট শেষ হয়ে গেছে। আগামীকাল আবার চেষ্টা করুন।";
        } else if (errorStr.includes("Safety")) {
          userFriendlyError = "দুঃখিত, এই ছবিটি এআই পলিসি অনুযায়ী বিশ্লেষণ করা সম্ভব নয়।";
        }

        setError(userFriendlyError);
        updatedImages[i] = { ...updatedImages[i], loading: false };
        setImages([...updatedImages]);
        break;
      }
    }
    setIsAnalyzing(false);
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto min-h-full pb-24">
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-black text-eid-green mb-2 bengali-text">আউটফিট রেটিং</h2>
        <p className="text-sm sm:text-base text-gray-600 bengali-text">আপনার ঈদের পোশাকের ছবি আপলোড করুন এবং এআই রেটিং নিন!</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-2xl text-red-600 text-sm bengali-text flex items-center gap-2">
          <Info size={18} />
          {error}
        </div>
      )}

      <div className="mb-8">
        <label className="block w-full aspect-square max-w-[280px] sm:max-w-sm mx-auto bg-white border-4 border-dashed border-eid-gold/30 rounded-[40px] cursor-pointer hover:border-eid-gold/50 transition-all overflow-hidden relative group shadow-inner">
          <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          {images.length > 0 ? (
            <img src={images[0].preview} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-eid-gold/60">
              <Camera size={48} className="mb-3 group-hover:scale-110 transition-transform" />
              <span className="font-bold text-sm bengali-text">ছবি আপলোড করুন</span>
            </div>
          )}
          {images.length > 0 && (
            <button 
              onClick={(e) => { e.preventDefault(); removeImage(0); }}
              className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors z-20"
            >
              <X size={20} />
            </button>
          )}
        </label>
      </div>

      {images.length > 0 && images[0].rating && (
        <motion.div 
          initial={{ opacity: 0, y: 30, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="bg-white p-8 rounded-[40px] shadow-2xl border-2 border-eid-gold/20 mb-8 text-center relative overflow-hidden"
        >
          {/* Decorative Background Elements */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-eid-gold/5 rounded-full sm:blur-2xl blur-lg" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-eid-green/5 rounded-full sm:blur-2xl blur-lg" />
          
          <div className="flex flex-col items-center gap-2">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
              className={`text-7xl mb-2 ${getRatingInfo(images[0].rating).animation}`}
            >
              {getRatingInfo(images[0].rating).emoji}
            </motion.div>
            
            <div className="relative inline-block">
              <div className="text-7xl font-black text-eid-gold drop-shadow-md">
                {images[0].rating}
              </div>
              <div className="absolute -top-2 -right-6 bg-eid-green text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">
                Points
              </div>
            </div>

            <div className={`text-2xl font-black uppercase tracking-widest mt-2 ${getRatingInfo(images[0].rating).color}`}>
              {getRatingInfo(images[0].rating).text}
            </div>

            <div className="w-16 h-1 bg-eid-gold/20 rounded-full my-4" />

            <p className="text-gray-700 bengali-text leading-relaxed italic text-lg px-2">
              "{images[0].feedback}"
            </p>

            <div className="w-full mt-6 grid grid-cols-1 gap-4 text-left">
              <div className="bg-eid-green/5 p-4 rounded-2xl border border-eid-green/10">
                <div className="flex items-center gap-2 mb-1">
                  <Coins size={16} className="text-eid-green" />
                  <span className="text-xs font-bold text-eid-green uppercase tracking-wider">আনুমানিক দাম</span>
                </div>
                <div className="text-xl font-black text-eid-green bengali-text">
                  {images[0].estimatedPrice}
                </div>
              </div>

              <div className="bg-eid-gold/5 p-4 rounded-2xl border border-eid-gold/10">
                <div className="flex items-center gap-2 mb-1">
                  <ScrollText size={16} className="text-eid-gold" />
                  <span className="text-xs font-bold text-eid-gold uppercase tracking-wider">উপাদান ও বিশ্লেষণ</span>
                </div>
                <div className="text-sm text-gray-700 bengali-text leading-relaxed">
                  {images[0].materialDetails}
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                <div className="flex items-center gap-2 mb-1">
                  <Info size={16} className="text-blue-600" />
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">দামের পরামর্শ</span>
                </div>
                <div className="text-sm text-gray-700 bengali-text leading-relaxed">
                  {images[0].priceAdvice}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <div className="flex flex-col gap-4 max-w-sm mx-auto">
        <button
          onClick={analyzeOutfits}
          disabled={images.length === 0 || isAnalyzing || images.every(img => img.rating)}
          className="w-full bg-eid-green text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:bg-eid-green/90 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAnalyzing ? (
            <>
              <RefreshCw className="animate-spin" size={20} />
              <span className="bengali-text">বিশ্লেষণ করা হচ্ছে...</span>
            </>
          ) : images.every(img => img.rating) && images.length > 0 ? (
            <>
              <CheckCircle2 size={20} />
              <span className="bengali-text">বিশ্লেষণ সম্পন্ন!</span>
            </>
          ) : (
            <>
              <Sparkles size={20} />
              <span className="bengali-text">আউটফিট রেট করুন</span>
            </>
          )}
        </button>
        
        {images.length > 0 && !images.every(img => img.rating) && (
          <p className="text-center text-[10px] text-gray-400 italic bengali-text">
            * এআই আপনার পোশাকের রঙ, স্টাইল এবং ঐতিহ্যবাহী ভাব বিশ্লেষণ করবে।
          </p>
        )}
      </div>
    </div>
  );
};

const EidIbadotScreen = () => {
  const [checklist, setChecklist] = useState({
    ghosal: false,
    clothes: false,
    dates: false,
    takbir: false,
    namaz: false,
  });

  const toggleCheck = (key: keyof typeof checklist) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto min-h-full pb-24">
      <div className="text-center mb-8">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="inline-block p-4 bg-eid-gold/20 rounded-full mb-4"
        >
          <Moon size={48} className="text-eid-gold" />
        </motion.div>
        <h2 className="text-3xl font-bold text-eid-green bengali-text">🌙 Eid Ibadot – ঈদের ইবাদত ও দোয়ার সহজ গাইড</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. ঈদের নামাজের নিয়ম */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white p-6 rounded-3xl shadow-lg border border-eid-gold/20"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-eid-green/10 rounded-lg">
              <BookOpen className="text-eid-green" size={24} />
            </div>
            <h3 className="text-xl font-bold text-eid-green bengali-text">ঈদের নামাজের নিয়ম</h3>
          </div>
          <div className="space-y-3 text-gray-600 text-sm">
            <p className="font-bold text-eid-gold">নিয়াত:</p>
            <p className="italic">"আমি কিবলামুখী হয়ে ইমামের পিছনে ঈদের দুই রাকাত ওয়াজিব নামাজ অতিরিক্ত ছয় তাকবিরের সাথে আদায় করছি।"</p>
            <p className="font-bold text-eid-gold">ধাপসমূহ:</p>
            <ul className="list-disc ml-5 space-y-1">
              <li>১ম রাকাতে সানা পড়ার পর ৩টি অতিরিক্ত তাকবির।</li>
              <li>২য় রাকাতে রুকুতে যাওয়ার আগে ৩টি অতিরিক্ত তাকবির।</li>
              <li>দেরিতে যোগ দিলে: ইমামের সাথে যেটুকু পাবেন আদায় করবেন, বাকিটুকু নিজে পূর্ণ করবেন।</li>
            </ul>
          </div>
        </motion.div>

        {/* 2. ঈদের সুন্নাহ চেকলিস্ট */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white p-6 rounded-3xl shadow-lg border border-eid-gold/20"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-eid-gold/10 rounded-lg">
              <CheckCircle2 className="text-eid-gold" size={24} />
            </div>
            <h3 className="text-xl font-bold text-eid-green bengali-text">ঈদের সুন্নাহ চেকলিস্ট</h3>
          </div>
          <div className="space-y-3">
            {[
              { key: 'ghosal', label: 'ঈদের নামাজের আগে গোসল করা' },
              { key: 'clothes', label: 'সুন্দর ও পরিষ্কার পোশাক পরা' },
              { key: 'dates', label: 'ঈদুল ফিতরে বিজোড় সংখ্যক খেজুর খাওয়া' },
              { key: 'takbir', label: 'তাকবির বলতে বলতে ঈদগাহে যাওয়া' },
              { key: 'namaz', label: 'ঈদের নামাজ জামাতে আদায় করা' },
            ].map((item) => (
              <div 
                key={item.key}
                onClick={() => toggleCheck(item.key as any)}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${checklist[item.key as keyof typeof checklist] ? 'bg-eid-green border-eid-green' : 'border-gray-300'}`}>
                  {checklist[item.key as keyof typeof checklist] && <Plus size={16} className="text-white rotate-45" />}
                </div>
                <span className={`text-sm ${checklist[item.key as keyof typeof checklist] ? 'text-eid-green font-bold line-through opacity-60' : 'text-gray-600'}`}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* 3. ঈদের দোয়া সংগ্রহ */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white p-6 rounded-3xl shadow-lg border border-eid-gold/20"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-eid-red/10 rounded-lg">
              <Sparkles className="text-eid-red" size={24} />
            </div>
            <h3 className="text-xl font-bold text-eid-green bengali-text">ঈদের দোয়া সংগ্রহ</h3>
          </div>
          <div className="space-y-4">
            <div className="p-3 bg-eid-cream rounded-xl border border-eid-gold/30">
              <p className="text-xs text-eid-gold font-bold mb-1">ঈদের তাকবির:</p>
              <p className="text-lg font-arabic text-center mb-2">اللَّهُ أَكْبَرُ اللَّهُ أَكْبَرُ لَا إلَهَ إلَّا اللَّهُ وَاللَّهُ أَكْبَرُ اللَّهُ أَكْبَرُ وَلِلَّهِ الْحَمْدُ</p>
              <p className="text-[10px] text-gray-500 text-center">আল্লাহু আকবার, আল্লাহু আকবার, লা ইলাহা ইল্লাল্লাহু, আল্লাহু আকবার, আল্লাহু আকবার, ওয়া লিল্লাহিল হামদ।</p>
            </div>
            <div className="text-sm text-gray-600 space-y-2">
              <p><span className="font-bold text-eid-gold">শুভেচ্ছা দোয়া:</span> "তাকাব্বালাল্লাহু মিন্না ওয়া মিনকুম" (আল্লাহ আমাদের ও আপনাদের পক্ষ থেকে কবুল করুন)</p>
              <p><span className="font-bold text-eid-gold">চাঁদ দেখার দোয়া:</span> "আল্লাহুম্মা আহিল্লাহু আলাইনা বিল আমনি ওয়াল ঈমানি ওয়াস সালামাতি ওয়াল ইসলামি রাব্বি ওয়া রাব্বুকাল্লাহ।"</p>
            </div>
          </div>
        </motion.div>

        {/* 4. কোরবানির গাইড */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white p-6 rounded-3xl shadow-lg border border-eid-gold/20"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-eid-green/10 rounded-lg">
              <ScrollText className="text-eid-green" size={24} />
            </div>
            <h3 className="text-xl font-bold text-eid-green bengali-text">কোরবানির গাইড (Adha)</h3>
          </div>
          <div className="space-y-2 text-gray-600 text-sm">
            <p><span className="font-bold text-eid-gold">পশু:</span> গরু, মহিষ, উট (সর্বোচ্চ ৭ ভাগ); ছাগল, ভেড়া, দুম্বা (১ ভাগ)।</p>
            <p><span className="font-bold text-eid-gold">মাংস বণ্টন:</span> ৩ ভাগ করা মুস্তাহাব (নিজের জন্য, আত্মীয়দের জন্য, গরিবদের জন্য)।</p>
            <p><span className="font-bold text-eid-gold">সুন্নাহ পদ্ধতি:</span> পশুকে কষ্ট না দিয়ে ধারালো ছুরি দিয়ে জবেহ করা এবং কিবলামুখী করা সুন্নাহ।</p>
          </div>
        </motion.div>

        {/* 5. যাকাতুল ফিতর গাইড */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white p-6 rounded-3xl shadow-lg border border-eid-gold/20"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-eid-gold/10 rounded-lg">
              <Coins className="text-eid-gold" size={24} />
            </div>
            <h3 className="text-xl font-bold text-eid-green bengali-text">যাকাতুল ফিতর গাইড</h3>
          </div>
          <div className="space-y-2 text-gray-600 text-sm">
            <p><span className="font-bold text-eid-gold">কার উপর ফরজ:</span> ঈদের দিন যার কাছে জীবনযাত্রার প্রয়োজনীয় ব্যয়ের অতিরিক্ত নিসাব পরিমাণ সম্পদ থাকে।</p>
            <p><span className="font-bold text-eid-gold">কখন:</span> ঈদের নামাজের আগে দেওয়া ওয়াজিব।</p>
            <p><span className="font-bold text-eid-gold">পরিমাণ:</span> সাধারণত ১ সা' (প্রায় ৩ কেজি) খাদ্যশস্য বা সমপরিমাণ মূল্য।</p>
          </div>
        </motion.div>

        {/* 6. ঈদের খুতবা */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white p-6 rounded-3xl shadow-lg border border-eid-gold/20"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-eid-red/10 rounded-lg">
              <Info className="text-eid-red" size={24} />
            </div>
            <h3 className="text-xl font-bold text-eid-green bengali-text">ঈদের খুতবা</h3>
          </div>
          <p className="text-gray-600 text-sm">
            ঈদের নামাজের পর খুতবা শোনা সুন্নাহ। খুতবায় ঈদের গুরুত্ব, ভ্রাতৃত্ব এবং ইসলামের শিক্ষা আলোচনা করা হয়। খুতবা চলাকালীন কথা বলা বা অন্য কাজে লিপ্ত হওয়া অনুচিত।
          </p>
        </motion.div>

        {/* 7. গুরুত্বপূর্ণ ছোট দোয়া */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white p-6 rounded-3xl shadow-lg border border-eid-gold/20 col-span-1 md:col-span-2"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-eid-green/10 rounded-lg">
              <Heart className="text-eid-green" size={24} />
            </div>
            <h3 className="text-xl font-bold text-eid-green bengali-text">গুরুত্বপূর্ণ ছোট দোয়া (Daily Duas)</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="p-3 bg-eid-cream/50 rounded-xl border border-eid-gold/10">
              <p className="font-bold text-eid-gold">ঘর থেকে বের হওয়ার দোয়া:</p>
              <p className="italic">"বিসমিল্লাহি তাওয়াক্কালতু আলাল্লাহি লা হাওলা ওয়া লা কুওয়াতা ইল্লা বিল্লাহ।"</p>
            </div>
            <div className="p-3 bg-eid-cream/50 rounded-xl border border-eid-gold/10">
              <p className="font-bold text-eid-gold">মসজিদে যাওয়ার দোয়া:</p>
              <p className="italic">"আল্লাহুম্মাজ আল ফি কালবি নূরাঁও ওয়া ফি লিসানি নূরাঁও..." (বা সহজ দোয়া: আল্লাহুম্মাফ তাহলি আবওয়াবা রাহমাতিক)।</p>
            </div>
            <div className="p-3 bg-eid-cream/50 rounded-xl border border-eid-gold/10">
              <p className="font-bold text-eid-gold">খাবারের আগে ও পরে দোয়া:</p>
              <p className="italic">আগে: "বিসমিল্লাহি ওয়া আলা বারাকাতিল্লাহ।" পরে: "আলহামদু লিল্লাহিল্লাজি আতআমানা ওয়া সাকানা ওয়া জাআলানা মুসলিমিন।"</p>
            </div>
            <div className="p-3 bg-eid-cream/50 rounded-xl border border-eid-gold/10">
              <p className="font-bold text-eid-gold">ঘুমানোর দোয়া:</p>
              <p className="italic">"আল্লাহুম্মা বিসমিকা আমুতু ওয়া আহইয়া।"</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const AdminLoginScreen = ({ onBack, onLoginSuccess }: { onBack: () => void; onLoginSuccess: () => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onLoginSuccess();
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.code === 'auth/operation-not-allowed') {
        setError('Firebase-এ Email/Password login এনাবল করা নেই। দয়া করে Firebase Console থেকে এটি এনাবল করুন।');
      } else {
        setError('ইমেইল বা পাসওয়ার্ড ভুল হয়েছে। আবার চেষ্টা করুন।');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto space-y-8 min-h-full flex flex-col justify-center">
      <div className="text-center space-y-2">
        <div className="w-20 h-20 bg-eid-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Info size={40} className="text-eid-green" />
        </div>
        <h2 className="text-2xl font-black text-eid-green bengali-text">অ্যাডমিন লগইন</h2>
        <p className="text-gray-500 text-sm">শুধুমাত্র ডেভেলপারদের জন্য</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase ml-1">Email Address</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="mdomarspc99@gmail.com"
            className="w-full p-4 rounded-2xl border-2 border-gray-100 focus:border-eid-green outline-none transition-all"
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase ml-1">Password</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full p-4 rounded-2xl border-2 border-gray-100 focus:border-eid-green outline-none transition-all"
            required
          />
        </div>

        {error && (
          <p className="text-eid-red text-xs font-bold text-center">{error}</p>
        )}

        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-eid-green text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-emerald-800 transition-all flex items-center justify-center gap-2"
        >
          {loading ? <RefreshCw className="animate-spin" size={20} /> : 'লগইন করুন'}
        </button>

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-eid-cream px-2 text-gray-400 font-bold">Or</span></div>
        </div>

        <button 
          type="button"
          onClick={async () => {
            setLoading(true);
            try {
              await signInWithGoogle();
              onLoginSuccess();
            } catch (err) {
              setError('গুগল লগইন ব্যর্থ হয়েছে।');
            } finally {
              setLoading(false);
            }
          }}
          disabled={loading}
          className="w-full bg-white text-gray-700 border-2 border-gray-100 py-4 rounded-2xl font-bold shadow-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
          গুগল দিয়ে লগইন করুন
        </button>
      </form>

      <button 
        onClick={onBack}
        className="text-gray-400 text-sm font-bold hover:text-eid-green transition-colors"
      >
        ফিরে যান
      </button>
    </div>
  );
};

const AboutDeveloperScreen = ({ user }: { user: User | null }) => {
  const [profile, setProfile] = useState<{ photoUrl: string; name: string; profession: string; bio: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);

  const isAdmin = user?.email === 'mdomarspc99@gmail.com';

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        setProfile({
          name: 'Md Omar Faruk',
          profession: 'Graphic Designer',
          bio: 'আসসালামু আলাইকুম, আমি মোঃ ওমর ফারুক। আমি একজন প্রফেশনাল গ্রাফিক ডিজাইনার। আপনার ঈদের আনন্দকে আরও রাঙিয়ে তুলতে এই অ্যাপটি তৈরি করেছি।',
          photoUrl: 'https://picsum.photos/seed/developer/400/400'
        });
        setLoading(false);
      }
    }, 3000); // 3 seconds timeout for Firestore

    const unsub = onSnapshot(doc(db, 'developer_profile', 'main'), (doc) => {
      if (doc.exists()) {
        setProfile(doc.data() as any);
      } else {
        setProfile({
          name: 'Md Omar Faruk',
          profession: 'Graphic Designer',
          bio: 'আসসালামু আলাইকুম, আমি মোঃ ওমর ফারুক। আমি একজন প্রফেশনাল গ্রাফিক ডিজাইনার। আপনার ঈদের আনন্দকে আরও রাঙিয়ে তুলতে এই অ্যাপটি তৈরি করেছি।',
          photoUrl: 'https://picsum.photos/seed/developer/400/400'
        });
      }
      setLoading(false);
      clearTimeout(timeout);
    }, (error) => {
      console.error('Firestore error:', error);
      setLoading(false);
      clearTimeout(timeout);
    });
    return () => {
      unsub();
      clearTimeout(timeout);
    };
  }, []);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage(null);
    try {
      const base64 = await fileToBase64(file);
      const photoUrl = `data:${file.type};base64,${base64}`;
      
      await setDoc(doc(db, 'developer_profile', 'main'), {
        name: 'Md Omar Faruk',
        profession: 'Graphic Designer',
        bio: 'আসসালামু আলাইকুম, আমি মোঃ ওমর ফারুক। আমি একজন প্রফেশনাল গ্রাফিক ডিজাইনার। আপনার ঈদের আনন্দকে আরও রাঙিয়ে তুলতে এই অ্যাপটি তৈরি করেছি।',
        photoUrl,
        lastUpdated: serverTimestamp()
      }, { merge: true });
      
      setMessage({ text: 'ছবি সফলভাবে আপলোড হয়েছে!', type: 'success' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Upload error:', error);
      setMessage({ text: 'আপলোড ব্যর্থ হয়েছে। ছবির সাইজ ১এমবি এর কম হতে হবে।', type: 'error' });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-full"><RefreshCw className="animate-spin text-eid-green" /></div>;

  return (
    <div className="p-6 max-w-md mx-auto space-y-8">
      {message && (
        <div className={`p-3 rounded-xl text-center text-sm font-bold ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}
      <div className="relative">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-48 h-48 mx-auto rounded-full border-4 border-eid-gold shadow-2xl overflow-hidden relative group"
        >
          <img 
            src={profile?.photoUrl || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop"} 
            alt="Developer" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          {isAdmin && (
            <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Camera className="text-white mb-1" />
              <span className="text-[10px] text-white font-bold">Change Photo</span>
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
            </label>
          )}
          {uploading && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <RefreshCw className="animate-spin text-white" />
            </div>
          )}
        </motion.div>
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-eid-gold text-eid-green px-4 py-1 rounded-full text-xs font-black shadow-lg border border-white/20">
          DEVELOPER
        </div>
      </div>

      <div className="text-center space-y-4">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-3xl font-black text-eid-green bengali-text">{profile?.name}</h2>
          <p className="text-eid-gold font-bold tracking-widest uppercase text-xs mt-1">{profile?.profession}</p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-3xl shadow-xl border border-eid-gold/10 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-2 opacity-10">
            <Star size={48} className="text-eid-gold" />
          </div>
          <p className="text-gray-700 leading-relaxed bengali-text text-lg">
            {profile?.bio}
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center gap-4"
        >
          <a 
            href="https://www.facebook.com/mdomars2" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 font-bold underline transition-all flex items-center gap-2"
          >
            <Share2 size={20} />
            FACEBOOK
          </a>
        </motion.div>
      </div>

      {isAdmin && (
        <div className="p-4 bg-eid-green/10 rounded-2xl border border-eid-green/20 text-center">
          <p className="text-xs text-eid-green font-bold">
            আপনি ডেভেলপার হিসেবে লগইন করেছেন। আপনি আপনার প্রোফাইল ছবি পরিবর্তন করতে পারেন।
          </p>
        </div>
      )}
    </div>
  );
};

const EID_CARDS = [
  {
    title: "ঈদুল ফিতর ২০২৬",
    subtitle: "Eid Mubarak",
    bg: "bg-gradient-to-br from-eid-green via-emerald-900 to-black",
  },
  {
    title: "পবিত্র ঈদ মোবারক",
    subtitle: "Blessings & Peace",
    bg: "bg-gradient-to-br from-eid-gold via-yellow-800 to-black",
  },
  {
    title: "খুশির ঈদ আনন্দ",
    subtitle: "Celebrate Together",
    bg: "bg-gradient-to-br from-eid-red via-rose-900 to-black",
  },
  {
    title: "ঈদ উল ফিতর",
    subtitle: "Joyful Moments",
    bg: "bg-gradient-to-br from-indigo-900 via-purple-900 to-black",
  },
  {
    title: "ঈদ মোবারক",
    subtitle: "Happiness Always",
    bg: "bg-gradient-to-br from-slate-800 via-eid-green to-black",
  }
];

export default function App() {
  const [screen, setScreen] = useState<Screen>('entry');
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlashcardModalOpen, setIsFlashcardModalOpen] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (screen === 'splash') {
      const timer = setTimeout(() => setScreen('menu'), 3500);
      return () => clearTimeout(timer);
    }
  }, [screen]);

  const handleEnter = () => {
    setIsMusicPlaying(true);
    setScreen('splash');
  };

  return (
    <div className="absolute inset-0 font-sans selection:bg-eid-gold selection:text-eid-green overflow-hidden">
      <BackgroundMusic isPlaying={isMusicPlaying} />
      
      <AnimatePresence mode="wait">
        {screen === 'entry' && (
          <motion.div
            key="entry"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="absolute inset-0 z-[150] flex items-center justify-center bg-eid-green p-6"
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-white p-10 rounded-[40px] shadow-2xl text-center max-w-sm border-8 border-eid-gold relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-eid-gold" />
              <div className="mb-6 inline-block p-4 bg-eid-cream rounded-full">
                <Sparkles size={48} className="text-eid-gold animate-pulse" />
              </div>
              <h1 className="text-3xl font-black text-eid-green leading-tight bengali-text">
                ঈদ আড্ডা ২০২৬ এ স্বাগতম!
              </h1>
              <p className="mt-4 text-gray-600 bengali-text">
                মিউজিক সহ অ্যাপটি উপভোগ করতে নিচের বাটনে ক্লিক করুন
              </p>
              
              <button
                onClick={handleEnter}
                className="mt-8 w-full bg-eid-gold text-eid-green py-4 rounded-2xl font-bold text-xl shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 bengali-text"
              >
                <Play size={24} fill="currentColor" />
                প্রবেশ করুন
              </button>
            </motion.div>
          </motion.div>
        )}

        {screen === 'splash' && (
          <motion.div
            key="splash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="absolute inset-0 z-[100] flex items-center justify-center bg-eid-green p-6"
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="bg-white p-10 rounded-[40px] shadow-2xl text-center max-w-sm border-8 border-eid-gold relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-eid-gold" />
              <div className="mb-6 inline-block p-4 bg-eid-cream rounded-full">
                <Sparkles size={48} className="text-eid-gold animate-pulse" />
              </div>
              <h1 className="text-3xl font-black text-eid-green leading-tight bengali-text">
                আপনাকে ঈদুল ফিতর ২০২৬ এর শুভেচ্ছা - ঈদ মোবারাক
              </h1>
              <div className="mt-8 flex justify-center gap-2">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ repeat: Infinity, delay: i * 0.2, duration: 1 }}
                    className="w-3 h-3 bg-eid-gold rounded-full"
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {screen === 'menu' && (
          <motion.div
            key="menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex flex-col overflow-hidden"
          >
            {/* Watermark Background Animations */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
              <div className="absolute inset-0 bg-gradient-to-b from-eid-cream via-white to-eid-cream opacity-50" />
              
              {/* Scattered Small Festive Elements - Optimized for performance */}
              <div className="absolute inset-0">
                {/* Top Left */}
                <motion.div 
                  animate={{ y: [0, -10, 0], rotate: [0, 10, 0] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-[12%] left-[8%] text-eid-gold opacity-30"
                >
                  <Moon size={32} />
                </motion.div>
                
                {/* Top Right */}
                <motion.div 
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-[18%] right-[12%] text-eid-green opacity-20"
                >
                  <Star size={20} fill="currentColor" />
                </motion.div>

                {/* Middle Left */}
                <motion.div 
                  animate={{ x: [0, 10, 0] }}
                  transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-[45%] left-[5%] text-eid-red opacity-15"
                >
                  <Sparkles size={24} />
                </motion.div>

                {/* Middle Right */}
                <motion.div 
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                  className="absolute top-[40%] right-[5%] text-eid-gold opacity-20"
                >
                  <Star size={16} />
                </motion.div>

                {/* Bottom Left */}
                <motion.div 
                  animate={{ y: [0, 8, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute bottom-[25%] left-[10%] text-eid-green opacity-20"
                >
                  <Moon size={28} />
                </motion.div>

                {/* Bottom Right */}
                <motion.div 
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute bottom-[15%] right-[15%] text-eid-red opacity-15"
                >
                  <Sparkles size={32} />
                </motion.div>

                {/* Floating Lanterns */}
                <motion.div 
                  animate={{ y: [0, -15, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-[25%] left-[20%] opacity-15"
                >
                  <span className="text-xl">🏮</span>
                </motion.div>

                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute bottom-[35%] right-[18%] opacity-15"
                >
                  <span className="text-lg">🏮</span>
                </motion.div>
              </div>

              {/* Decorative Corners */}
              <div className="absolute top-0 left-0 w-32 h-32 border-t-4 border-l-4 border-eid-gold/20 rounded-tl-3xl m-4" />
              <div className="absolute top-0 right-0 w-32 h-32 border-t-4 border-r-4 border-eid-gold/20 rounded-tr-3xl m-4" />
              <div className="absolute bottom-0 left-0 w-32 h-32 border-b-4 border-l-4 border-eid-gold/20 rounded-bl-3xl m-4" />
              <div className="absolute bottom-0 right-0 w-32 h-32 border-b-4 border-r-4 border-eid-gold/20 rounded-br-3xl m-4" />

              <div className="absolute bottom-0 left-0 right-0 h-32 bg-eid-green/10 sm:blur-3xl blur-lg rounded-t-full translate-y-16" />
            </div>

            <Header 
              title="EID ADDA" 
              onSelfie={() => setScreen('selfie')} 
              onTitleClick={() => setScreen('login')}
            />
            
            <div className="h-2" /> {/* Spacer instead of floating button */}

            <main className="flex-1 px-4 py-6 flex flex-col gap-6 max-w-md mx-auto w-full overflow-y-auto relative z-10">
              {/* Eid Suveccha Cards Carousel - Compact Flash Card */}
              <div className="relative h-20 w-full overflow-hidden rounded-2xl shadow-md border border-eid-gold/30 bg-black shrink-0">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentCardIndex}
                    initial={{ x: 300, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -300, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    onDragEnd={(_, info) => {
                      if (info.offset.x < -50) {
                        setCurrentCardIndex((prev) => (prev + 1) % EID_CARDS.length);
                      } else if (info.offset.x > 50) {
                        setCurrentCardIndex((prev) => (prev - 1 + EID_CARDS.length) % EID_CARDS.length);
                      }
                    }}
                    onClick={() => setIsFlashcardModalOpen(true)}
                    className={`absolute inset-0 px-4 py-3 flex items-center justify-between cursor-grab active:cursor-grabbing ${EID_CARDS[currentCardIndex].bg}`}
                  >
                    {/* Glassmorphism Overlay */}
                    <div className="absolute inset-2 border border-white/10 rounded-xl pointer-events-none" />

                    <div className="flex items-center gap-3 relative z-10">
                      <div className="bg-white/20 p-2 rounded-lg">
                        <Sparkles size={20} className="text-eid-gold" />
                      </div>
                      <div className="flex flex-col justify-center">
                        <motion.h2 
                          className="text-lg font-bold text-white bengali-text leading-tight"
                        >
                          {EID_CARDS[currentCardIndex].title}
                        </motion.h2>
                        <motion.p 
                          className="text-eid-gold font-bold tracking-wider uppercase text-[9px]"
                        >
                          {EID_CARDS[currentCardIndex].subtitle}
                        </motion.p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 relative z-10">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsMusicPlaying(!isMusicPlaying);
                        }}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-full border border-white/20 text-white transition-all"
                      >
                        {isMusicPlaying ? <Volume2 size={16} /> : <VolumeX size={16} />}
                      </button>
                      <button
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-full border border-white/20 text-white transition-all"
                      >
                        <Maximize2 size={16} />
                      </button>
                    </div>
                    
                    {/* Progress Line */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 flex overflow-hidden">
                      {EID_CARDS.map((_, i) => (
                        <div 
                          key={i} 
                          className={`h-full flex-1 transition-all duration-500 ${i === currentCardIndex ? 'bg-eid-gold' : 'bg-transparent'}`} 
                        />
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>
                
                {/* Swipe Hints - Subtle */}
                <div className="absolute inset-y-0 left-1 flex items-center pointer-events-none opacity-20">
                  <ChevronLeft className="text-white" size={16} />
                </div>
                <div className="absolute inset-y-0 right-1 flex items-center pointer-events-none opacity-20">
                  <ChevronRight className="text-white" size={16} />
                </div>
              </div>

              {/* Menu Grid - 3 Columns */}
              <div className="grid grid-cols-3 gap-3">
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  onClick={() => setScreen('ibadot')}
                  className="group bg-white aspect-square p-2 rounded-2xl shadow-md border border-eid-gold/10 hover:border-eid-green cursor-pointer transition-all hover:shadow-lg flex flex-col items-center justify-center text-center gap-1"
                >
                  <div className="bg-eid-green/10 p-2 rounded-xl group-hover:scale-110 transition-transform">
                    <Moon size={24} className="text-eid-green" />
                  </div>
                  <h3 className="text-xs font-bold text-eid-green bengali-text">ঈদ ইবাদত</h3>
                </motion.div>

                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  onClick={() => setScreen('salami')}
                  className="group bg-white aspect-square p-2 rounded-2xl shadow-md border border-eid-gold/10 hover:border-eid-gold cursor-pointer transition-all hover:shadow-lg flex flex-col items-center justify-center text-center gap-1"
                >
                  <div className="bg-eid-gold/20 p-2 rounded-xl group-hover:scale-110 transition-transform">
                    <Gift size={24} className="text-eid-gold" />
                  </div>
                  <h3 className="text-xs font-bold text-eid-green bengali-text">সালামি চাও</h3>
                </motion.div>

                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  onClick={() => setScreen('outfit')}
                  className="group bg-white aspect-square p-2 rounded-2xl shadow-md border border-eid-gold/10 hover:border-eid-gold cursor-pointer transition-all hover:shadow-lg flex flex-col items-center justify-center text-center gap-1"
                >
                  <div className="bg-eid-gold/20 p-2 rounded-xl group-hover:scale-110 transition-transform">
                    <Shirt size={24} className="text-eid-gold" />
                  </div>
                  <h3 className="text-xs font-bold text-eid-green bengali-text">আউটফিট</h3>
                </motion.div>

                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  onClick={() => setScreen('game')}
                  className="group bg-white aspect-square p-2 rounded-2xl shadow-md border border-eid-gold/10 hover:border-eid-red cursor-pointer transition-all hover:shadow-lg flex flex-col items-center justify-center text-center gap-1"
                >
                  <div className="bg-eid-red/10 p-2 rounded-xl group-hover:scale-110 transition-transform">
                    <Gamepad2 size={24} className="text-eid-red" />
                  </div>
                  <h3 className="text-xs font-bold text-eid-green bengali-text">ঈদ গেইম</h3>
                </motion.div>

                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  onClick={() => setScreen('outing')}
                  className="group bg-white aspect-square p-2 rounded-2xl shadow-md border border-eid-gold/10 hover:border-eid-green cursor-pointer transition-all hover:shadow-lg flex flex-col items-center justify-center text-center gap-1"
                >
                  <div className="bg-eid-green/10 p-2 rounded-xl group-hover:scale-110 transition-transform">
                    <MapPin size={24} className="text-eid-green" />
                  </div>
                  <h3 className="text-xs font-bold text-eid-green bengali-text">ঘুরাঘুরি</h3>
                </motion.div>

                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  onClick={() => setScreen('spin')}
                  className="group bg-white aspect-square p-2 rounded-2xl shadow-md border border-eid-gold/10 hover:border-eid-gold cursor-pointer transition-all hover:shadow-lg flex flex-col items-center justify-center text-center gap-1"
                >
                  <div className="bg-eid-gold/20 p-2 rounded-xl group-hover:scale-110 transition-transform">
                    <Sparkles size={24} className="text-eid-gold" />
                  </div>
                  <h3 className="text-xs font-bold text-eid-green bengali-text">সালামি স্পিন</h3>
                </motion.div>

                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  onClick={() => setScreen('food')}
                  className="group bg-white aspect-square p-2 rounded-2xl shadow-md border border-eid-gold/10 hover:border-eid-red cursor-pointer transition-all hover:shadow-lg flex flex-col items-center justify-center text-center gap-1"
                >
                  <div className="bg-eid-red/10 p-2 rounded-xl group-hover:scale-110 transition-transform">
                    <Utensils size={24} className="text-eid-red" />
                  </div>
                  <h3 className="text-xs font-bold text-eid-green bengali-text">খাবার</h3>
                </motion.div>

                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  onClick={() => setScreen('stories')}
                  className="group bg-white aspect-square p-2 rounded-2xl shadow-md border border-eid-gold/10 hover:border-eid-gold cursor-pointer transition-all hover:shadow-lg flex flex-col items-center justify-center text-center gap-1"
                >
                  <div className="bg-eid-gold/20 p-2 rounded-xl group-hover:scale-110 transition-transform">
                    <Film size={24} className="text-eid-gold" />
                  </div>
                  <h3 className="text-xs font-bold text-eid-green bengali-text">ঈদ গল্প</h3>
                </motion.div>

                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  onClick={() => setScreen('about')}
                  className="group bg-white aspect-square p-2 rounded-2xl shadow-md border border-eid-gold/10 hover:border-eid-green cursor-pointer transition-all hover:shadow-lg flex flex-col items-center justify-center text-center gap-1"
                >
                  <div className="bg-eid-green/10 p-2 rounded-xl group-hover:scale-110 transition-transform">
                    <Info size={24} className="text-eid-green" />
                  </div>
                  <h3 className="text-xs font-bold text-eid-green bengali-text">ডেভেলপার</h3>
                </motion.div>
              </div>

              {/* FAQ Bar */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1 }}
                onClick={() => setIsChatOpen(true)}
                className="bg-gradient-to-r from-eid-green to-emerald-800 p-4 rounded-2xl shadow-lg border border-eid-gold/30 cursor-pointer hover:brightness-110 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-xl group-hover:rotate-12 transition-transform">
                    <HelpCircle size={20} className="text-eid-gold" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm bengali-text">EID জিজ্ঞাসা</h4>
                    <p className="text-white/60 text-[10px] bengali-text">সাধারণ প্রশ্ন ও উত্তর</p>
                  </div>
                </div>
              </motion.div>

              <footer className="pt-4 pb-2 text-center text-gray-400 text-[10px] tracking-wider shrink-0">
                <p>
                  Developed & Designed by 
                  <a 
                    href="https://www.facebook.com/mdomars2" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="ml-1 text-eid-green font-bold underline hover:text-eid-green/80 transition-colors"
                  >
                    MD OMARS
                  </a>
                </p>
              </footer>
            </main>
          </motion.div>
        )}

        {screen === 'salami' && (
          <motion.div key="salami" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col overflow-hidden">
            <Header title="সালামি কর্নার" onBack={() => setScreen('menu')} />
            <div className="flex-1 overflow-y-auto">
              <SalamiScreen />
            </div>
          </motion.div>
        )}

        {screen === 'game' && (
          <motion.div key="game" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col overflow-hidden">
            <Header title="সেমাই গেইম" onBack={() => setScreen('menu')} />
            <div className="flex-1 overflow-y-auto">
              <SemaiGame />
            </div>
          </motion.div>
        )}

        {screen === 'outing' && (
          <motion.div key="outing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col overflow-hidden">
            <Header title="ঈদ ঘুরাঘুরি" onBack={() => setScreen('menu')} />
            <div className="flex-1 overflow-y-auto">
              <OutingScreen />
            </div>
          </motion.div>
        )}

        {screen === 'spin' && (
          <motion.div key="spin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col overflow-hidden">
            <Header title="সালামি স্পিন হুইল" onBack={() => setScreen('menu')} />
            <div className="flex-1 overflow-y-auto">
              <SpinWheelScreen />
            </div>
          </motion.div>
        )}

        {screen === 'food' && (
          <motion.div key="food" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col overflow-hidden">
            <Header title="ঈদ খাবার লিস্ট" onBack={() => setScreen('menu')} />
            <div className="flex-1 overflow-y-auto">
              <FoodScreen />
            </div>
          </motion.div>
        )}

        {screen === 'stories' && (
          <motion.div key="stories" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col overflow-hidden">
            <Header title="ঈদ গল্প" onBack={() => setScreen('menu')} />
            <div className="flex-1 overflow-y-auto">
              <StoriesScreen />
            </div>
          </motion.div>
        )}

        {screen === 'outfit' && (
          <motion.div key="outfit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col overflow-hidden">
            <Header title="ঈদ আউটফিট রেটিং" onBack={() => setScreen('menu')} />
            <div className="flex-1 overflow-y-auto">
              <OutfitRatingScreen />
            </div>
          </motion.div>
        )}

        {screen === 'selfie' && (
          <motion.div key="selfie" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col overflow-hidden">
            <Header title="ঈদ সেলফি কার্ড" onBack={() => setScreen('menu')} />
            <div className="flex-1 overflow-y-auto">
              <SelfieScreen />
            </div>
          </motion.div>
        )}

        {screen === 'ibadot' && (
          <motion.div key="ibadot" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col overflow-hidden">
            <Header title="ঈদ ইবাদত গাইড" onBack={() => setScreen('menu')} />
            <div className="flex-1 overflow-y-auto">
              <EidIbadotScreen />
            </div>
          </motion.div>
        )}

        {screen === 'about' && (
          <motion.div key="about" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col overflow-hidden">
            <Header title="ডেভেলপার প্রোফাইল" onBack={() => setScreen('menu')} />
            <div className="flex-1 overflow-y-auto">
              <AboutDeveloperScreen user={user} />
            </div>
          </motion.div>
        )}

        {screen === 'login' && (
          <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col overflow-hidden">
            <Header title="অ্যাডমিন লগইন" onBack={() => setScreen('menu')} />
            <div className="flex-1 overflow-y-auto">
              <AdminLoginScreen onBack={() => setScreen('menu')} onLoginSuccess={() => setScreen('about')} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isFlashcardModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsFlashcardModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className={`relative w-full max-w-sm aspect-[3/4] rounded-3xl shadow-2xl overflow-hidden flex flex-col items-center justify-center p-8 text-center ${EID_CARDS[currentCardIndex].bg}`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Decorative Elements */}
              <div className="absolute top-0 left-0 w-32 h-32 border-t-4 border-l-4 border-white/20 rounded-tl-3xl m-4" />
              <div className="absolute top-0 right-0 w-32 h-32 border-t-4 border-r-4 border-white/20 rounded-tr-3xl m-4" />
              <div className="absolute bottom-0 left-0 w-32 h-32 border-b-4 border-l-4 border-white/20 rounded-bl-3xl m-4" />
              <div className="absolute bottom-0 right-0 w-32 h-32 border-b-4 border-r-4 border-white/20 rounded-br-3xl m-4" />
              
              <div className="bg-white/20 p-4 rounded-full mb-6">
                <Sparkles size={48} className="text-eid-gold" />
              </div>
              
              <h2 className="text-4xl font-bold text-white bengali-text leading-tight mb-4 drop-shadow-lg">
                {EID_CARDS[currentCardIndex].title}
              </h2>
              
              <p className="text-eid-gold font-bold tracking-[0.2em] uppercase text-sm drop-shadow-md">
                {EID_CARDS[currentCardIndex].subtitle}
              </p>

              <button
                onClick={() => setIsFlashcardModalOpen(false)}
                className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors"
              >
                <X size={24} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <EidJiggasa isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
}
