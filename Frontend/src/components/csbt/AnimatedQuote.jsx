import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const quotes = [
  "Give me your time, and soon people will say, 'Bhai, kya baat boli!'",
  "Skip this practice and prepare for 'Arey, mic kaam nahi kar raha' excuses!",
  "Talk to me, or get ready to be the 'hmm, theek hai' guy at every meeting!",
  "Put in the effort, or your speeches will be as flat as yesterday’s dosa!",
  "Give me practice, and I’ll make sure you’re the 'Sharma ji ka beta' of communication!",
];

export const AnimatedQuote = () => {
  const [quoteIndex, setQuoteIndex] = useState(0);

  // Handles quote transition every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prevIndex) => (prevIndex + 1) % quotes.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="flex justify-center items-center min-h-[120px] py-4 whitespace-normal break-keep"
      aria-live="polite"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={quoteIndex}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap justify-center gap-x-1 whitespace-normal break-keep break-words"
        >
          {quotes[quoteIndex].split(" ").map((word, wordIndex) => (
            <span key={wordIndex} className="whitespace-nowrap">
              {word.split("").map((char, charIndex) => (
                <motion.span
                  key={`${wordIndex}-${charIndex}`}
                  initial={{
                    opacity: 0,
                    x: Math.random() * 400 - 200,
                    y: Math.random() * 400 - 200,
                    scale: 0,
                    rotate: Math.random() * 180 - 90,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                    y: 0,
                    scale: 1,
                    rotate: 0,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0,
                    transition: { duration: 0.3 },
                  }}
                  transition={{
                    type: "spring",
                    damping: 15,
                    stiffness: 120,
                    delay: charIndex * 0.02,
                  }}
                  className="inline-block text-2xl md:text-3xl font-bold text-slate-600 "
                >
                  {char}
                </motion.span>
              ))}
              <span>&nbsp;</span>
            </span>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
