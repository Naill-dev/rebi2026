import { useState, useEffect, useCallback, useRef } from 'react';
import JSZip from 'jszip';
import { generateFullStandaloneHTML } from './standaloneHTML';

/* ───────── helpers ───────── */
const random = (min: number, max: number) => Math.random() * (max - min) + min;

/* ───────── Petal component ───────── */
const PETAL_COLORS = [
  'rgba(244, 114, 182, 0.7)',
  'rgba(236, 72, 153, 0.6)',
  'rgba(251, 113, 133, 0.65)',
  'rgba(249, 168, 212, 0.6)',
  'rgba(232, 121, 249, 0.5)',
  'rgba(192, 132, 252, 0.5)',
  'rgba(251, 191, 36, 0.4)',
];

interface PetalData {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  color: string;
  shape: number;
}

function Petal({ left, size, duration, delay, color, shape }: Omit<PetalData, 'id'>) {
  const petalShapes: Record<number, string> = {
    0: '🌸', 1: '🌺', 2: '💮', 3: '✿', 4: '❀', 5: '🌷', 6: '🌹',
  };
  return (
    <div
      className="fixed pointer-events-none animate-petal-fall z-10"
      style={{
        left: `${left}%`,
        top: '-5%',
        fontSize: `${size}px`,
        animationDuration: `${duration}s`,
        animationDelay: `${delay}s`,
        color,
        filter: `drop-shadow(0 0 ${size / 3}px ${color})`,
      }}
    >
      {petalShapes[shape] || '🌸'}
    </div>
  );
}

/* ───────── Sparkle component ───────── */
interface SparkleData { id: number; x: number; y: number; size: number; delay: number; }

function Sparkle({ x, y, size, delay }: Omit<SparkleData, 'id'>) {
  return (
    <div
      className="fixed pointer-events-none animate-sparkle z-20"
      style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${delay}s`, fontSize: `${size}px` }}
    >
      ✦
    </div>
  );
}

/* ───────── Magic particles on click ───────── */
interface ClickParticle { id: number; x: number; y: number; emoji: string; }

function ClickBurst({ x, y, emoji }: Omit<ClickParticle, 'id'>) {
  const particles = Array.from({ length: 8 }, (_, i) => {
    const angle = (i / 8) * Math.PI * 2;
    const dist = random(30, 80);
    return { tx: Math.cos(angle) * dist, ty: Math.sin(angle) * dist, delay: i * 0.03 };
  });
  return (
    <>
      {particles.map((p, i) => (
        <span
          key={i}
          className="fixed pointer-events-none z-50"
          style={{
            left: x, top: y,
            fontSize: random(12, 22),
            animation: `fadeOutBurst 1s ease-out ${p.delay}s forwards`,
            ['--tx' as string]: `${p.tx}px`,
            ['--ty' as string]: `${p.ty}px`,
          }}
        >
          {emoji}
        </span>
      ))}
      <style>{`@keyframes fadeOutBurst{0%{opacity:1;transform:translate(0,0) scale(1)}100%{opacity:0;transform:translate(var(--tx),var(--ty)) scale(0)}}`}</style>
    </>
  );
}

/* ───────── Floating background orbs ───────── */
function BackgroundOrbs() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute rounded-full animate-float-slow" style={{ width: 500, height: 500, top: '10%', left: '-5%', background: 'radial-gradient(circle, rgba(244,114,182,0.15) 0%, transparent 70%)', filter: 'blur(40px)' }} />
      <div className="absolute rounded-full animate-float" style={{ width: 400, height: 400, top: '50%', right: '-5%', background: 'radial-gradient(circle, rgba(192,132,252,0.15) 0%, transparent 70%)', filter: 'blur(40px)', animationDelay: '2s' }} />
      <div className="absolute rounded-full animate-float-slow" style={{ width: 350, height: 350, bottom: '5%', left: '30%', background: 'radial-gradient(circle, rgba(251,191,36,0.1) 0%, transparent 70%)', filter: 'blur(40px)', animationDelay: '4s' }} />
      <div className="absolute rounded-full animate-float" style={{ width: 300, height: 300, top: '30%', left: '50%', background: 'radial-gradient(circle, rgba(251,113,133,0.1) 0%, transparent 70%)', filter: 'blur(50px)', animationDelay: '1s' }} />
    </div>
  );
}

/* ───────── Decorative border frame ───────── */
function DecorativeFrame() {
  return (
    <div className="fixed inset-4 md:inset-8 pointer-events-none z-30 rounded-3xl border border-pink-400/10 animate-border-glow">
      <div className="absolute -top-2 -left-2 text-3xl animate-twinkle" style={{ animationDelay: '0s' }}>✧</div>
      <div className="absolute -top-2 -right-2 text-3xl animate-twinkle" style={{ animationDelay: '0.7s' }}>✧</div>
      <div className="absolute -bottom-2 -left-2 text-3xl animate-twinkle" style={{ animationDelay: '1.4s' }}>✧</div>
      <div className="absolute -bottom-2 -right-2 text-3xl animate-twinkle" style={{ animationDelay: '2.1s' }}>✧</div>
      <div className="absolute top-1/2 -left-3 text-2xl animate-twinkle text-pink-300/50" style={{ animationDelay: '0.5s' }}>❋</div>
      <div className="absolute top-1/2 -right-3 text-2xl animate-twinkle text-purple-300/50" style={{ animationDelay: '1.2s' }}>❋</div>
      <div className="absolute -top-3 left-1/2 text-2xl animate-twinkle text-amber-300/50" style={{ animationDelay: '1.8s' }}>❋</div>
      <div className="absolute -bottom-3 left-1/2 text-2xl animate-twinkle text-pink-300/50" style={{ animationDelay: '2.5s' }}>❋</div>
    </div>
  );
}

/* ───────── Envelope Opening ───────── */
function EnvelopeIntro({ onOpen }: { onOpen: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-br from-gray-950 via-purple-950/40 to-gray-950">
      <BackgroundOrbs />
      <div className="relative flex flex-col items-center gap-8">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-twinkle text-amber-300/60"
            style={{
              top: `${50 + Math.sin((i / 12) * Math.PI * 2) * 45}%`,
              left: `${50 + Math.cos((i / 12) * Math.PI * 2) * 45}%`,
              animationDelay: `${i * 0.3}s`,
              fontSize: random(10, 20),
            }}
          >
            ✦
          </div>
        ))}
        <button
          onClick={onOpen}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className="relative group cursor-pointer transition-all duration-700"
          style={{ transform: hovered ? 'scale(1.08) translateY(-10px)' : 'scale(1)' }}
        >
          <div className="animate-pulse-glow rounded-3xl p-1" style={{ background: 'linear-gradient(135deg, rgba(244,114,182,0.3), rgba(192,132,252,0.3), rgba(251,191,36,0.3))' }}>
            <div className="bg-gray-950/90 rounded-3xl px-16 py-14 md:px-24 md:py-20 flex flex-col items-center gap-6">
              <div className="text-7xl md:text-8xl animate-float" style={{ animationDuration: '3s' }}>💌</div>
              <div className="font-great-vibes text-3xl md:text-4xl text-gradient-magic">Xüsusi Təbrik</div>
              <div className="font-cormorant text-pink-300/70 text-lg tracking-widest uppercase">Rəbiyyə Xanım üçün</div>
              <div className="mt-4 flex items-center gap-2 text-pink-200/50 text-sm font-cormorant tracking-wider transition-all duration-500" style={{ opacity: hovered ? 1 : 0.6, transform: hovered ? 'translateY(0)' : 'translateY(5px)' }}>
                <span className="animate-heartbeat inline-block">💖</span>
                <span>Açmaq üçün toxunun</span>
                <span className="animate-heartbeat inline-block">💖</span>
              </div>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}

/* ───────── Download Buttons Panel ───────── */
function DownloadPanel() {
  const [downloading, setDownloading] = useState(false);
  const [done, setDone] = useState(false);
  const [progress, setProgress] = useState('');
  const [downloadType, setDownloadType] = useState<'html' | 'zip' | ''>('');

  const downloadHTML = async () => {
    if (downloading) return;
    setDownloading(true);
    setDownloadType('html');
    setDone(false);
    setProgress('HTML hazırlanır...');
    try {
      await new Promise(r => setTimeout(r, 500));
      const htmlContent = generateFullStandaloneHTML();
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'Rəbiyyə_Xanım_8_Mart_Təbrik.html';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      setDone(true);
      setProgress('');
      setTimeout(() => { setDone(false); setDownloadType(''); }, 4000);
    } catch {
      setProgress('Xəta baş verdi!');
      setTimeout(() => { setProgress(''); setDownloadType(''); }, 3000);
    } finally {
      setDownloading(false);
    }
  };

  const downloadZIP = async () => {
    if (downloading) return;
    setDownloading(true);
    setDownloadType('zip');
    setDone(false);
    setProgress('ZIP hazırlanır...');
    try {
      await new Promise(r => setTimeout(r, 300));
      const zip = new JSZip();
      const folder = zip.folder('Rəbiyyə_Xanım_8_Mart_Təbrik');
      if (folder) {
        setProgress('HTML əlavə edilir...');
        const htmlContent = generateFullStandaloneHTML();
        folder.file('Təbrik_Kartı.html', htmlContent);

        const textMessage = `═══════════════════════════════════════════
         8 MART - BEYNƏLXALQ QADINLAR GÜNÜ
═══════════════════════════════════════════

         Hörmətli Rəbiyyə Xanım!

  Sizin varlığınız bu dünyanın ən gözəl 
  bəzəyidir. Qəlbinizin hərarəti, 
  gülüşünüzün işığı hər yeri aydınladır. 
  
  Bu xüsusi gündə Sizə sonsuz xoşbəxtlik, 
  möhkəm cansağlığı və həyatınızın hər 
  anında sevinc arzulayıram.

  Gözəlliyiniz çiçəkləri, zərifliyin 
  mənasını, güc və məhəbbətin harmoniyasını 
  simvolizə edir. Siz bu bayramın ruhusunuz!

─────────────────────────────────────────

  🌸 Xoşbəxtlik - Həyatınızın hər anı 
     sevinc və xoşbəxtliklə dolu olsun

  💖 Sevgi - Sevdiklərinizin hərarəti 
     həmişə qəlbinizi isitsin

  ✨ Uğurlar - Bütün arzularınız 
     gerçəkləşsin, yolunuz həmişə açıq olsun

─────────────────────────────────────────

     🦋 Bahar gəlir, çiçəklər açır,
        Günəş doğur, ürəklər açılır.
        Bu gözəl gündə, ay Rəbiyyə xanım,
        Sizə dünya gözəllikləri yaraşır.

        Həmişə gülün, həmişə parlayın!

─────────────────────────────────────────

     💝 Bayramınız Mübarək! 💝

        Sonsuz sevgi və hörmətlə

  🌸 🌺 🌷 🌹 🌻 💐 🌸

═══════════════════════════════════════════
        8 Mart 2025 
   Beynəlxalq Qadınlar Günü
═══════════════════════════════════════════`;
        folder.file('Təbrik_Mesajı.txt', textMessage);
      }

      setProgress('ZIP yaradılır...');
      const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(zipBlob);
      link.download = 'Rəbiyyə_Xanım_8_Mart_Təbrik.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      setDone(true);
      setProgress('');
      setTimeout(() => { setDone(false); setDownloadType(''); }, 4000);
    } catch {
      setProgress('Xəta baş verdi!');
      setTimeout(() => { setProgress(''); setDownloadType(''); }, 3000);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[200]">
      {/* Notification toast */}
      {(done || (progress && !done)) && (
        <div className="flex justify-center mb-4 px-4">
          <div className={`animate-fade-in-up glass-card rounded-2xl px-6 py-4 ${done ? 'border-green-400/20' : 'border-amber-400/20'} border`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{done ? '✅' : '⏳'}</span>
              <div>
                <div className={`font-playfair text-base font-bold ${done ? 'text-green-300' : 'text-amber-300'}`}>
                  {done ? 'Uğurla yükləndi!' : progress}
                </div>
                <div className={`font-cormorant text-sm ${done ? 'text-green-200/50' : 'text-amber-200/50'}`}>
                  {done
                    ? (downloadType === 'zip' ? 'ZIP faylı hazırdır' : 'HTML faylı hazırdır')
                    : 'Bir az gözləyin...'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Download bar */}
      <div
        className="backdrop-blur-xl border-t border-white/5"
        style={{ background: 'linear-gradient(to top, rgba(10,1,24,0.95), rgba(10,1,24,0.8))' }}
      >
        <div className="max-w-3xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center gap-3">
          {/* Info text */}
          <div className="flex-1 text-center sm:text-left">
            <div className="font-playfair text-white/80 text-sm md:text-base font-bold">
              💝 Təbriki yükləyin & paylaşın
            </div>
            <div className="font-cormorant text-pink-300/40 text-xs md:text-sm">
              Brauzerdə açın, hostinqə yükləyin, mesaj göndərin — hər yerdə işləyir!
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3">
            {/* Download HTML */}
            <button
              onClick={downloadHTML}
              disabled={downloading}
              className="group relative cursor-pointer"
            >
              <div className="relative flex items-center gap-3 px-5 py-3 md:px-6 md:py-4 rounded-xl border border-pink-400/30 backdrop-blur-xl transition-all duration-500 group-hover:scale-105 group-hover:border-pink-400/60 group-active:scale-95"
                style={{ background: 'linear-gradient(135deg, rgba(244,114,182,0.15), rgba(192,132,252,0.12))' }}
              >
                <div className="text-2xl md:text-3xl">
                  {downloading && downloadType === 'html' ? '⏳' : '🌐'}
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-playfair text-white/90 text-sm md:text-base font-bold">
                    {downloading && downloadType === 'html' ? 'Hazırlanır...' : 'HTML Yüklə'}
                  </span>
                  <span className="font-cormorant text-pink-300/50 text-xs">
                    Tək fayl · Hər yerdə açılır
                  </span>
                </div>
                <div className="absolute -top-1 -right-1 text-xs animate-twinkle text-amber-300" style={{ animationDelay: '0s' }}>✦</div>
              </div>
            </button>

            {/* Download ZIP */}
            <button
              onClick={downloadZIP}
              disabled={downloading}
              className="group relative cursor-pointer"
            >
              <div className="relative flex items-center gap-3 px-5 py-3 md:px-6 md:py-4 rounded-xl border border-purple-400/30 backdrop-blur-xl transition-all duration-500 group-hover:scale-105 group-hover:border-purple-400/60 group-active:scale-95"
                style={{ background: 'linear-gradient(135deg, rgba(192,132,252,0.15), rgba(251,191,36,0.08))' }}
              >
                <div className="text-2xl md:text-3xl">
                  {downloading && downloadType === 'zip' ? '📦' : '📥'}
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-playfair text-white/90 text-sm md:text-base font-bold">
                    {downloading && downloadType === 'zip' ? 'Hazırlanır...' : 'ZIP Yüklə'}
                  </span>
                  <span className="font-cormorant text-purple-300/50 text-xs">
                    HTML + Mətn faylı
                  </span>
                </div>
                <div className="absolute -top-1 -right-1 text-xs bg-purple-500/80 text-white rounded-full w-5 h-5 flex items-center justify-center font-bold" style={{ fontSize: '8px' }}>
                  ZIP
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────── Main greeting card ───────── */
function GreetingCard() {
  const [visibleSections, setVisibleSections] = useState<Set<number>>(new Set());
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const idx = Number(entry.target.getAttribute('data-idx'));
          if (entry.isIntersecting) setVisibleSections((prev) => new Set([...prev, idx]));
        });
      },
      { threshold: 0.2 }
    );
    sectionRefs.current.forEach((ref) => { if (ref) observer.observe(ref); });
    return () => observer.disconnect();
  }, []);

  const setSectionRef = (idx: number) => (el: HTMLDivElement | null) => { sectionRefs.current[idx] = el; };
  const sectionClass = (idx: number) =>
    `transition-all duration-1000 ${visibleSections.has(idx) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`;

  return (
    <div className="relative min-h-screen flex flex-col items-center py-12 md:py-20 px-4 z-10 pb-40">
      {/* Section 0: 8 MART Header */}
      <div ref={setSectionRef(0)} data-idx="0" className={sectionClass(0)}>
        <div className="text-center mb-6">
          <div className="inline-block relative">
            <span className="text-6xl md:text-8xl lg:text-9xl font-playfair font-bold text-gradient-gold animate-glow-text">8</span>
            <span className="text-4xl md:text-6xl lg:text-7xl font-playfair font-bold text-gradient-pink ml-3 md:ml-5">MART</span>
            <div className="absolute -top-4 -right-6 text-2xl animate-twinkle">✨</div>
            <div className="absolute -bottom-2 -left-4 text-xl animate-twinkle" style={{ animationDelay: '1s' }}>✨</div>
          </div>
        </div>
        <div className="text-center mb-12 md:mb-20">
          <h2 className="font-cormorant text-xl md:text-2xl tracking-[0.3em] uppercase text-pink-300/70 mb-2">Beynəlxalq</h2>
          <h1 className="font-playfair text-3xl md:text-5xl text-white/90 italic">Qadınlar Günü</h1>
          <div className="flex items-center justify-center gap-4 mt-6">
            <div className="h-px w-16 md:w-24 bg-gradient-to-r from-transparent to-pink-400/50" />
            <span className="text-2xl animate-heartbeat">🌹</span>
            <div className="h-px w-16 md:w-24 bg-gradient-to-l from-transparent to-pink-400/50" />
          </div>
        </div>
      </div>

      {/* Section 1: Name */}
      <div ref={setSectionRef(1)} data-idx="1" className={`${sectionClass(1)} mb-16 md:mb-24`}>
        <div className="text-center">
          <div className="font-cormorant text-lg md:text-xl text-purple-300/60 tracking-widest uppercase mb-4">Hörmətli</div>
          <div className="relative inline-block">
            <h2 className="font-great-vibes text-5xl md:text-7xl lg:text-8xl text-gradient-magic py-2">Rəbiyyə Xanım</h2>
            <div className="mt-2 mx-auto flex items-center justify-center gap-2">
              <div className="h-px w-12 bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />
              <span className="text-amber-400/60 text-xs">◆</span>
              <div className="h-px w-20 bg-gradient-to-r from-transparent via-pink-400/60 to-transparent" />
              <span className="text-pink-400/60 text-xs">◆</span>
              <div className="h-px w-12 bg-gradient-to-r from-transparent via-purple-400/60 to-transparent" />
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Main Card */}
      <div ref={setSectionRef(2)} data-idx="2" className={`${sectionClass(2)} w-full max-w-3xl mb-16 md:mb-24`}>
        <div className="glass-card rounded-3xl p-8 md:p-14 animate-pulse-glow relative overflow-hidden">
          <div className="absolute top-4 left-4 text-pink-300/20 text-6xl font-great-vibes select-none">❝</div>
          <div className="absolute bottom-4 right-4 text-pink-300/20 text-6xl font-great-vibes select-none">❞</div>
          <div className="relative z-10">
            <div className="flex justify-center mb-8">
              <span className="text-5xl md:text-6xl animate-float" style={{ animationDuration: '4s' }}>🌺</span>
            </div>
            <p className="font-cormorant text-xl md:text-2xl lg:text-3xl text-pink-100/90 leading-relaxed md:leading-loose text-center italic">
              Sizin varlığınız bu dünyanın ən gözəl bəzəyidir.
              Qəlbinizin hərarəti, gülüşünüzün işığı hər yeri
              aydınladır. Bu xüsusi gündə Sizə sonsuz xoşbəxtlik,
              möhkəm cansağlığı və həyatınızın hər anında sevinc arzulayıram.
            </p>
            <div className="flex items-center justify-center gap-3 my-8">
              <div className="h-px w-8 bg-amber-400/30" />
              <span className="text-amber-400/50">✦</span>
              <div className="h-px w-8 bg-amber-400/30" />
            </div>
            <p className="font-cormorant text-xl md:text-2xl lg:text-3xl text-purple-100/85 leading-relaxed md:leading-loose text-center italic">
              Gözəlliyiniz çiçəkləri, zərifliyin mənasını,
              güc və məhəbbətin harmoniyasını simvolizə edir.
              Siz bu bayramın ruhusunuz!
            </p>
          </div>
        </div>
      </div>

      {/* Section 3: Flower arrangement */}
      <div ref={setSectionRef(3)} data-idx="3" className={`${sectionClass(3)} mb-16 md:mb-24`}>
        <div className="flex items-center justify-center gap-4 md:gap-6 text-4xl md:text-5xl">
          <span className="animate-float" style={{ animationDelay: '0s', animationDuration: '5s' }}>🌷</span>
          <span className="animate-float" style={{ animationDelay: '0.5s', animationDuration: '4.5s' }}>🌹</span>
          <span className="animate-float" style={{ animationDelay: '1s', animationDuration: '5.5s' }}>🌸</span>
          <span className="animate-heartbeat text-5xl md:text-6xl">💐</span>
          <span className="animate-float" style={{ animationDelay: '1.5s', animationDuration: '5s' }}>🌸</span>
          <span className="animate-float" style={{ animationDelay: '2s', animationDuration: '4.5s' }}>🌹</span>
          <span className="animate-float" style={{ animationDelay: '2.5s', animationDuration: '5.5s' }}>🌷</span>
        </div>
      </div>

      {/* Section 4: Wishes */}
      <div ref={setSectionRef(4)} data-idx="4" className={`${sectionClass(4)} w-full max-w-4xl mb-16 md:mb-24`}>
        <div className="text-center mb-10">
          <h3 className="font-great-vibes text-3xl md:text-5xl text-gradient-gold">Ən xoş arzularla</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { emoji: '🌸', title: 'Xoşbəxtlik', text: 'Həyatınızın hər anı sevinc və xoşbəxtliklə dolu olsun' },
            { emoji: '💖', title: 'Sevgi', text: 'Sevdiklərinizin hərarəti həmişə qəlbinizi isitsin' },
            { emoji: '✨', title: 'Uğurlar', text: 'Bütün arzularınız gerçəkləşsin, yolunuz həmişə açıq olsun' },
          ].map((item, i) => (
            <div
              key={i}
              className="glass-card rounded-2xl p-6 md:p-8 text-center group hover:scale-105 transition-all duration-500 hover:border-pink-400/30 cursor-default"
              style={{ transitionDelay: `${i * 150}ms` }}
            >
              <div className="text-4xl md:text-5xl mb-4 group-hover:animate-heartbeat transition-transform">{item.emoji}</div>
              <h4 className="font-playfair text-xl md:text-2xl text-pink-200 mb-3">{item.title}</h4>
              <p className="font-cormorant text-lg text-pink-100/60 leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Section 5: Poem */}
      <div ref={setSectionRef(5)} data-idx="5" className={`${sectionClass(5)} w-full max-w-2xl mb-16 md:mb-24`}>
        <div className="glass-card rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-transparent to-purple-500/5" />
          <div className="relative z-10">
            <div className="text-4xl mb-6 animate-butterfly">🦋</div>
            <div className="space-y-4 font-cormorant text-xl md:text-2xl text-pink-100/80 italic leading-relaxed">
              <p>Bahar gəlir, çiçəklər açır,</p>
              <p>Günəş doğur, ürəklər açılır.</p>
              <p>Bu gözəl gündə, ay Rəbiyyə xanım,</p>
              <p>Sizə dünya gözəllikləri yaraşır.</p>
            </div>
            <div className="mt-8 flex items-center justify-center gap-2">
              <span className="text-pink-400/40">─────</span>
              <span className="text-2xl">🌹</span>
              <span className="text-pink-400/40">─────</span>
            </div>
            <p className="mt-6 font-cormorant text-lg text-purple-200/60">Həmişə gülün, həmişə parlayın!</p>
          </div>
        </div>
      </div>

      {/* Section 6: Grand finale */}
      <div ref={setSectionRef(6)} data-idx="6" className={`${sectionClass(6)} text-center mb-16`}>
        <div className="relative inline-block">
          <span className="text-7xl md:text-9xl animate-heartbeat">💝</span>
          <div className="absolute -top-2 -right-2 text-xl animate-twinkle">✨</div>
          <div className="absolute -bottom-1 -left-3 text-lg animate-twinkle" style={{ animationDelay: '1s' }}>✨</div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full text-sm animate-twinkle" style={{ animationDelay: '0.5s' }}>⭐</div>
        </div>
        <h2 className="font-great-vibes text-4xl md:text-6xl lg:text-7xl text-gradient-magic mt-8 mb-4">Bayramınız Mübarək!</h2>
        <p className="font-cormorant text-xl md:text-2xl text-pink-200/50 tracking-wider">Sonsuz sevgi və hörmətlə</p>
        <div className="mt-10 flex items-center justify-center gap-3 text-3xl">
          <span className="animate-float" style={{ animationDelay: '0s' }}>🌸</span>
          <span className="animate-float" style={{ animationDelay: '0.3s' }}>🌺</span>
          <span className="animate-float" style={{ animationDelay: '0.6s' }}>🌷</span>
          <span className="animate-float" style={{ animationDelay: '0.9s' }}>🌹</span>
          <span className="animate-float" style={{ animationDelay: '1.2s' }}>🌻</span>
          <span className="animate-float" style={{ animationDelay: '1.5s' }}>💐</span>
          <span className="animate-float" style={{ animationDelay: '1.8s' }}>🌸</span>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-8">
        <p className="font-cormorant text-sm text-pink-300/30 tracking-widest uppercase">8 Mart 2025 · Beynəlxalq Qadınlar Günü</p>
      </div>
    </div>
  );
}

/* ───────── Main App ───────── */
export default function App() {
  const [opened, setOpened] = useState(false);
  const [petals, setPetals] = useState<PetalData[]>([]);
  const [sparkles, setSparkles] = useState<SparkleData[]>([]);
  const [clickParticles, setClickParticles] = useState<ClickParticle[]>([]);
  const [showContent, setShowContent] = useState(false);
  const petalIdRef = useRef(0);

  useEffect(() => {
    if (!opened) return;
    const interval = setInterval(() => {
      const newPetal: PetalData = {
        id: petalIdRef.current++,
        left: random(0, 100),
        size: random(14, 30),
        duration: random(8, 16),
        delay: 0,
        color: PETAL_COLORS[Math.floor(random(0, PETAL_COLORS.length))],
        shape: Math.floor(random(0, 7)),
      };
      setPetals((prev) => [...prev.slice(-25), newPetal]);
    }, 1200);
    return () => clearInterval(interval);
  }, [opened]);

  useEffect(() => {
    if (!opened) return;
    const s: SparkleData[] = Array.from({ length: 20 }, (_, i) => ({
      id: i, x: random(5, 95), y: random(5, 95), size: random(8, 18), delay: random(0, 5),
    }));
    setSparkles(s);
  }, [opened]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    const emojis = ['✨', '💖', '🌸', '⭐', '💫', '🌹', '🦋', '💝'];
    const emoji = emojis[Math.floor(random(0, emojis.length))];
    const newParticle: ClickParticle = { id: Date.now(), x: e.clientX, y: e.clientY, emoji };
    setClickParticles((prev) => [...prev.slice(-5), newParticle]);
    setTimeout(() => { setClickParticles((prev) => prev.filter((p) => p.id !== newParticle.id)); }, 1200);
  }, []);

  const handleOpen = useCallback(() => {
    setOpened(true);
    setTimeout(() => setShowContent(true), 300);
  }, []);

  return (
    <div
      className="min-h-screen relative overflow-x-hidden"
      style={{
        background: opened
          ? 'linear-gradient(135deg, #0c0118 0%, #1a0a2e 20%, #12001f 40%, #0d0015 60%, #150520 80%, #0a0a1a 100%)'
          : undefined,
      }}
      onClick={opened ? handleClick : undefined}
    >
      {!opened && <EnvelopeIntro onOpen={handleOpen} />}
      {opened && (
        <>
          <BackgroundOrbs />
          <DecorativeFrame />
          {petals.map((p) => <Petal key={p.id} {...p} />)}
          {sparkles.map((s) => <Sparkle key={s.id} {...s} />)}
          {clickParticles.map((cp) => <ClickBurst key={cp.id} {...cp} />)}
          {showContent && (
            <div className="animate-fade-in-up">
              <GreetingCard />
            </div>
          )}
          {showContent && <DownloadPanel />}
        </>
      )}
    </div>
  );
}
