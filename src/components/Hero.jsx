import { motion } from "framer-motion";
import { styles } from "../styles";
import { lazy, Suspense, useState, useEffect } from "react";
import CanvasLoader from "./Loader";

const LazyForestrySceneCanvas = lazy(() => import("./canvas/ForestryScene"));

const TypewriterText = ({ texts }) => {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    const typingInterval = setInterval(() => {
      if (isTyping) {
        const currentText = texts[currentIndex];
        if (displayText.length < currentText.length) {
          setDisplayText((prevText) => currentText.slice(0, prevText.length + 1));
        } else {
          setIsTyping(false);
          clearInterval(typingInterval);
          setTimeout(() => {
            setIsTyping(true);
            setDisplayText("");
            setCurrentIndex((prevIndex) => (prevIndex + 1) % texts.length);
          }, 2000); // Delay before next typing cycle
        }
      }
    }, 100); // Typing speed

    return () => {
      clearInterval(typingInterval);
    };
  }, [currentIndex, isTyping, texts, displayText]);

  return (
    <span className="inline-block text-forest-sage font-bold">
      {displayText.split('').map((char, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.1 }}
        >
          {char}
        </motion.span>
      ))}
      {isTyping && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
          className="inline-block ml-1"
        >
          |
        </motion.span>
      )}
    </span>
  );
};

const WavingHand = () => {
  return (
    <img 
      src="https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f44b.png" 
      alt="Waving Hand"
      className="wave-emoji"
      style={{ display: 'inline-block', marginLeft: '10px', width: '50px', height: '50px' }}
    />
  );
};

const Hero = () => {
  const enableForestryScene = import.meta.env.VITE_ENABLE_FORESTRY_SCENE === "true";

  return (
    <section className="relative w-full h-screen mx-auto overflow-hidden">
      <div className="absolute inset-0 z-0">
        {enableForestryScene ? (
          <Suspense fallback={<CanvasLoader />}>
            <LazyForestrySceneCanvas />
          </Suspense>
        ) : (
          <div className="absolute inset-0">
            <video
              className="hero-video h-full w-full object-cover"
              src="/video/hero-mulching.mp4"
              poster="/video/hero-mulching-poster.jpg"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              aria-hidden="true"
            />
          </div>
        )}
      </div>

      <div className={`absolute inset-0 top-[120px] z-10 max-w-7xl mx-auto ${styles.paddingX} flex flex-row items-start gap-5`}>
        <div className="flex flex-col justify-center items-center mt-5">
          <div className="w-5 h-5 rounded-full bg-forest-sage" />
          <div className="w-1 sm:h-80 h-40 violet-gradient" />
        </div>

        <div>
          <h1 className={`${styles.heroHeadText}`}>
            Professional Land Clearing. Done Right the First Time.
          </h1>
          <p className={`${styles.heroSubText} mt-2`}>
            Forestry mulching, defensible space, access creation, and site prep across Western Montana.
          </p>
          <p className="mt-4 text-lg text-stone-light/80">
            Commercial-grade equipment. Terrain-aware methods. No shortcuts.
          </p>
        </div>
      </div>

      <div className="absolute xs:bottom-10 bottom-32 w-full flex justify-center items-center z-10">
        <a href="#services">
          <div className="w-[35px] h-[64px] rounded-3xl border-4 border-stone-mid flex justify-center items-start p-2">
            <motion.div
              animate={{
                y: [0, 24, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: "loop",
              }}
              className="w-3 h-3 rounded-full bg-stone-mid mb-1"
            />
          </div>
        </a>
      </div>
    </section>
  );
};

export default Hero;
