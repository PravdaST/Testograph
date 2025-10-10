'use client'

import Image from "next/image";
import { useState } from "react";

interface SuccessStory {
  id: number;
  image: string;
  caption: string;
}

const successStories: SuccessStory[] = [
  { id: 1, image: "/success-stories/success-1.png", caption: "12 седмици" },
  { id: 2, image: "/success-stories/success-2.png", caption: "3 месеца прогрес" },
  { id: 3, image: "/success-stories/success-3.png", caption: "90 дни" },
  { id: 4, image: "/success-stories/success-4.png", caption: "Естествен подход" },
  { id: 5, image: "/success-stories/success-5.png", caption: "4 месеца" },
  { id: 6, image: "/success-stories/success-6.png", caption: "Клиент от София" },
  { id: 7, image: "/success-stories/success-7.png", caption: "6 месеца протокол" },
  { id: 8, image: "/success-stories/success-8.png", caption: "Видими резултати" },
  { id: 9, image: "/success-stories/success-9.png", caption: "3 месеца следване" },
  { id: 10, image: "/success-stories/success-10.png", caption: "5 месеца" },
  { id: 11, image: "/success-stories/success-11.png", caption: "Природен начин" },
  { id: 12, image: "/success-stories/success-12.png", caption: "Дългосрочен резултат" },
];

export const SuccessStoriesWall = () => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  return (
    <div className="w-full overflow-hidden">
      {/* CSS Keyframe animation for continuous scroll */}
      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .scroll-container {
          animation: scroll 15s linear infinite;
        }
        .scroll-container:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* Auto-scrolling Conveyor Belt */}
      <div className="overflow-hidden">
        <div className="scroll-container flex gap-4">
          {/* Duplicate stories twice for seamless infinite loop */}
          {[...successStories, ...successStories].map((story, index) => (
            <div
              key={`${story.id}-${index}`}
              className="flex-shrink-0 w-[45%] md:w-[30%] lg:w-[23%] xl:w-[18%]"
            >
              <div
                className="group relative bg-card/50 backdrop-blur-sm rounded-xl border border-border/50 hover:border-primary/50 transition-all duration-300 overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage(story.id);
                }}
              >
                {/* Image Container */}
                <div className="relative aspect-square overflow-hidden">
                  <Image
                    src={story.image}
                    alt={`Success story ${story.id}`}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 45vw, (max-width: 1024px) 30vw, (max-width: 1280px) 23vw, 18vw"
                  />
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Testograph Logo Overlay - Masks diamond watermark */}
                  <div className="absolute bottom-2 right-2 w-8 h-8 md:w-10 md:h-10 bg-background/80 backdrop-blur-sm rounded-md flex items-center justify-center p-1 shadow-lg">
                    <Image
                      src="/testograph-logo.png"
                      alt="Testograph"
                      width={32}
                      height={32}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>

                {/* Caption - Single Line */}
                <div className="p-2 bg-card/80 backdrop-blur-sm border-t border-border/30">
                  <p className="text-xs md:text-sm font-medium text-center text-foreground group-hover:text-primary transition-colors truncate">
                    {story.caption}
                  </p>
                </div>

                {/* Before/After Label Overlay */}
                <div className="absolute top-2 left-2 right-2 flex justify-between pointer-events-none">
                  <span className="text-xs font-bold bg-destructive/90 text-white px-2 py-1 rounded">
                    Преди
                  </span>
                  <span className="text-xs font-bold bg-success/90 text-white px-2 py-1 rounded">
                    След
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal for Full View */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl w-full h-auto">
            <Image
              src={`/success-stories/success-${selectedImage}.png`}
              alt={`Success story ${selectedImage}`}
              width={1000}
              height={1000}
              className="w-full h-auto rounded-lg"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage(null);
              }}
              className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
