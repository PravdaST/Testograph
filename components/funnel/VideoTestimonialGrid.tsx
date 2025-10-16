"use client";

import { useState } from "react";
import { Play, Quote } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface VideoTestimonial {
  id: number;
  name: string;
  age: number;
  problem: string;
  badge: string;
  keyQuote: string;
  thumbnail: string;
  videoUrl?: string; // Optional - for when actual videos are uploaded
  duration: string;
}

const testimonials: VideoTestimonial[] = [
  {
    id: 1,
    name: "Димитър К.",
    age: 37,
    problem: "Либидо",
    badge: "След 3 седмици",
    keyQuote: "Жена ми ме попита 'Какво взе? Искам и аз такова!' 😅",
    thumbnail: "/api/placeholder/400/300",
    duration: "0:47"
  },
  {
    id: 2,
    name: "Стоян Г.",
    age: 42,
    problem: "Енергия",
    badge: "След 2 седмици",
    keyQuote: "Преди заспивах на бюрото до обяд. Сега тичам 5км преди работа.",
    thumbnail: "/api/placeholder/400/300",
    duration: "1:12"
  },
  {
    id: 3,
    name: "Красимир В.",
    age: 29,
    problem: "Мускулна маса",
    badge: "След 8 седмици",
    keyQuote: "От 78кг на 86кг. Треньорът ми не вярваше на очите си.",
    thumbnail: "/api/placeholder/400/300",
    duration: "1:34"
  },
  {
    id: 4,
    name: "Атанас П.",
    age: 39,
    problem: "Фертилност",
    badge: "След 4 месеца",
    keyQuote: "След 3 години опити... жена ми е бременна. Това е чудо.",
    thumbnail: "/api/placeholder/400/300",
    duration: "2:03"
  },
  {
    id: 5,
    name: "Валентин Н.",
    age: 44,
    problem: "Самочувствие",
    badge: "След 6 седмици",
    keyQuote: "Изгубих мъжествеността си. TestoUP ми я върна.",
    thumbnail: "/api/placeholder/400/300",
    duration: "1:28"
  },
  {
    id: 6,
    name: "Ивайло С.",
    age: 35,
    problem: "Сън и Възстановяване",
    badge: "След 3 седмици",
    keyQuote: "Заспивам за 5 минути. Будя се зареден. Първи път от години.",
    thumbnail: "/api/placeholder/400/300",
    duration: "0:53"
  }
];

export function VideoTestimonialGrid() {
  const [selectedVideo, setSelectedVideo] = useState<VideoTestimonial | null>(null);

  return (
    <>
      <section className="py-12 md:py-16 px-4 bg-muted/30">
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

          {/* Video Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <Card
                key={testimonial.id}
                className="group overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer"
                onClick={() => setSelectedVideo(testimonial)}
              >
                {/* Video Thumbnail */}
                <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 overflow-hidden">
                  {/* Placeholder for actual video thumbnail */}
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
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-lg">
                        {testimonial.name}, {testimonial.age}г
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Проблем: {testimonial.problem}
                      </p>
                    </div>
                  </div>

                  {/* Key Quote */}
                  <div className="bg-muted/50 rounded-lg p-3 relative">
                    <Quote className="w-4 h-4 text-primary/40 absolute top-2 left-2" />
                    <p className="text-sm italic pl-5">
                      "{testimonial.keyQuote}"
                    </p>
                  </div>
                </div>
              </Card>
            ))}
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

              {/* Video Placeholder */}
              <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
                <div className="text-center text-white">
                  <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-sm opacity-75">
                    Видеото ще бъде добавено скоро
                  </p>
                  {selectedVideo.videoUrl && (
                    <p className="text-xs mt-2">
                      URL: {selectedVideo.videoUrl}
                    </p>
                  )}
                </div>
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
