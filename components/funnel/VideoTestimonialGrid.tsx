"use client";

import { useState, useEffect } from "react";
import { Play, Quote } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export interface VideoTestimonial {
  id: number;
  name: string;
  age: number;
  problem: string;
  badge: string;
  keyQuote: string;
  thumbnail?: string;
  videoUrl?: string;
  duration: string;
}

// Default testimonials (fallback)
const defaultTestimonials: VideoTestimonial[] = [
  {
    id: 1,
    name: "Димитър К.",
    age: 37,
    problem: "Либидо",
    badge: "След 3 седмици",
    keyQuote: "Жена ми ме попита 'Какво взе? Искам и аз такова!' 😅",
    duration: "0:47"
  },
  {
    id: 2,
    name: "Стоян Г.",
    age: 42,
    problem: "Енергия",
    badge: "След 2 седмици",
    keyQuote: "Преди заспивах на бюрото до обяд. Сега тичам 5км преди работа.",
    duration: "1:12"
  },
  {
    id: 3,
    name: "Красимир В.",
    age: 29,
    problem: "Мускулна маса",
    badge: "След 8 седмици",
    keyQuote: "От 78кг на 86кг. Треньорът ми не вярваше на очите си.",
    duration: "1:34"
  }
];

interface VideoTestimonialGridProps {
  testimonials?: VideoTestimonial[];
}

export function VideoTestimonialGrid({ testimonials = defaultTestimonials }: VideoTestimonialGridProps) {
  const [selectedVideo, setSelectedVideo] = useState<VideoTestimonial | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto-advance carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => {
        const nextIndex = (prev + 1) % testimonials.length;

        // Auto scroll on mobile
        if (window.innerWidth < 768) {
          const container = document.getElementById('video-scroll-container');
          if (container) {
            const cardWidth = container.scrollWidth / testimonials.length;
            container.scrollTo({
              left: cardWidth * nextIndex,
              behavior: 'smooth'
            });
          }
        }

        return nextIndex;
      });
    }, 5000); // Change every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <section id="testimonials" className="py-12 md:py-16 px-4 bg-muted/30">
        <style dangerouslySetInnerHTML={{__html: `
          /* Hide scrollbar */
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}} />
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4 text-sm">
              <Play className="w-4 h-4 mr-2" />
              Видео Отзиви
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Гледай Трансформациите В Реално Време
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Реални мъже. Реални истории. Реални резултати. Без филтри.
            </p>
          </div>

          {/* Video Carousel - 9:16 format */}
          <div className="relative">
            {/* Mobile: Horizontal Slider | Desktop: Grid */}
            <div
              id="video-scroll-container"
              className="flex md:grid overflow-x-auto md:overflow-visible gap-6 md:grid-cols-3 max-w-5xl mx-auto snap-x snap-mandatory scroll-smooth hide-scrollbar px-4 md:px-0"
            >
              {testimonials.map((testimonial, index) => (
                <Card
                  key={testimonial.id}
                  className={`group overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer min-w-[85vw] md:min-w-0 snap-center ${
                    index === activeIndex ? 'ring-2 ring-primary md:scale-105' : 'md:opacity-70 md:scale-95'
                  }`}
                  onClick={() => setSelectedVideo(testimonial)}
                >
                  {/* Video Thumbnail - 9:16 vertical format */}
                  <div className="relative aspect-[9/16] bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 overflow-hidden">
                    {/* Video thumbnail or poster */}
                    {testimonial.videoUrl && (
                      <video
                        className="absolute inset-0 w-full h-full object-cover"
                        poster={testimonial.thumbnail}
                        preload="metadata"
                      >
                        <source src={testimonial.videoUrl} type="video/mp4" />
                      </video>
                    )}

                    {/* Play button overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/30 transition-colors">
                      <div className="bg-white/90 dark:bg-black/90 rounded-full p-4 group-hover:scale-110 transition-transform">
                        <Play className="w-8 h-8 text-primary fill-primary" />
                      </div>
                    </div>

                    {/* Duration Badge */}
                    <Badge className="absolute bottom-2 right-2 bg-black/80 text-white">
                      {testimonial.duration}
                    </Badge>

                    {/* When Badge */}
                    <Badge variant="secondary" className="absolute top-2 left-2">
                      {testimonial.badge}
                    </Badge>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <div className="mb-2">
                      <h3 className="font-bold text-base">
                        {testimonial.name}, {testimonial.age}г
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Проблем: {testimonial.problem}
                      </p>
                    </div>

                    {/* Key Quote */}
                    <div className="bg-muted/50 rounded-lg p-2 relative">
                      <Quote className="w-3 h-3 text-primary/40 absolute top-1.5 left-1.5" />
                      <p className="text-xs italic pl-4">
                        "{testimonial.keyQuote}"
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Progress Dots */}
            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setActiveIndex(index);
                    // Auto scroll on mobile
                    const container = document.getElementById('video-scroll-container');
                    if (container && window.innerWidth < 768) {
                      const cardWidth = container.scrollWidth / testimonials.length;
                      container.scrollTo({
                        left: cardWidth * index,
                        behavior: 'smooth'
                      });
                    }
                  }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === activeIndex ? "bg-primary w-8" : "bg-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Bottom Note */}
          <div className="text-center mt-10">
            <p className="text-sm text-muted-foreground">
              Всички видеа са споделени с разрешение на участниците. Имена са съкратени за поверителност.
            </p>
          </div>
        </div>
      </section>

      {/* Video Dialog - For when actual videos are added */}
      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="max-w-4xl p-0">
          {selectedVideo && (
            <div className="space-y-4 p-6">
              <div>
                <h3 className="text-2xl font-bold mb-2">
                  {selectedVideo.name}, {selectedVideo.age}г
                </h3>
                <Badge variant="secondary">{selectedVideo.badge}</Badge>
              </div>

              {/* Video Player */}
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                {selectedVideo.videoUrl ? (
                  <video
                    controls
                    autoPlay
                    className="w-full h-full"
                    poster={selectedVideo.thumbnail}
                  >
                    <source src={selectedVideo.videoUrl} type="video/mp4" />
                    Браузърът не поддържа видео.
                  </video>
                ) : (
                  <div className="flex items-center justify-center h-full text-white">
                    <div className="text-center">
                      <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-sm opacity-75">
                        Видеото ще бъде добавено скоро
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Quote */}
              <div className="bg-muted rounded-lg p-4">
                <Quote className="w-5 h-5 text-primary/40 mb-2" />
                <p className="text-lg italic">
                  "{selectedVideo.keyQuote}"
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
