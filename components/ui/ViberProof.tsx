'use client'

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from 'embla-carousel-react';
import { ViberMessage } from "@/components/funnel/ViberMessage";
import { ViberPhotoAttachment } from "@/components/funnel/ViberPhotoAttachment";

interface ChatProof {
  id: number;
  name: string;
  age: number;
  avatar: string;
  messages: {
    text: string;
    time: string;
    date: string;
    isOutgoing: boolean;
    showAvatar?: boolean;
    hasAttachment?: boolean;
  }[];
  labResults?: { before: number; after: number; increase: string };
  doctorName?: string;
}

const chatProofs: ChatProof[] = [
  {
    id: 1,
    name: "Мартин",
    age: 34,
    avatar: "/funnel/emil-avatar.jpg",
    messages: [
      { text: "Резултатите дойдоха", time: "14:23", date: "вчера", isOutgoing: false, showAvatar: true },
      { text: "27.5 nmol/L показа!!!! 😱", time: "14:23", date: "вчера", isOutgoing: false },
      { text: "Преди месец бях на 10.0...", time: "14:24", date: "вчера", isOutgoing: false },
      { text: "Не вярвам как се случи това", time: "14:25", date: "вчера", isOutgoing: false },
      { text: "Феноменален напредък! Гордеем се с теб 💪", time: "14:28", date: "вчера", isOutgoing: true, hasAttachment: true }
    ],
    labResults: { before: 10.0, after: 27.5, increase: "+175%" },
    doctorName: "Д-р Иванов"
  },
  {
    id: 2,
    name: "Георги",
    age: 41,
    avatar: "/funnel/martin-avatar.jpg",
    messages: [
      { text: "Ей това май наистина работи", time: "21:47", date: "преди 2 дни", isOutgoing: false, showAvatar: true },
      { text: "Либидото ми се върна както преди 10 години", time: "21:48", date: "преди 2 дни", isOutgoing: false },
      { text: "Жена ми е шашната 😄", time: "21:48", date: "преди 2 дни", isOutgoing: false },
      { text: "Виждаш ли? Промяната е реална! 💯", time: "21:52", date: "преди 2 дни", isOutgoing: true }
    ]
  },
  {
    id: 3,
    name: "Емил",
    age: 48,
    avatar: "/funnel/georgi-avatar.jpg",
    messages: [
      { text: "Чуй какво ми каза вчера жена ми", time: "19:12", date: "преди седмица", isOutgoing: false, showAvatar: true },
      { text: "Пита ме какво съм взел 🤣", time: "19:12", date: "преди седмица", isOutgoing: false },
      { text: "Забелязала че съм друг човек", time: "19:13", date: "преди седмица", isOutgoing: false },
      { text: "Разбираш ли", time: "19:13", date: "преди седмица", isOutgoing: false },
      { text: "Отлично! Виждаш ли колко бързо стана? 😎", time: "19:18", date: "преди седмица", isOutgoing: true, hasAttachment: true }
    ],
    labResults: { before: 11.8, after: 24.2, increase: "+104%" },
    doctorName: "Д-р Петрова"
  },
  {
    id: 4,
    name: "Димитър",
    age: 37,
    avatar: "/funnel/dimitar-avatar.jpg",
    messages: [
      { text: "Днес в залата на лег преса", time: "18:34", date: "преди 3 дни", isOutgoing: false, showAvatar: true },
      { text: "Вдигнах 120кг!!", time: "18:34", date: "преди 3 дни", isOutgoing: false },
      { text: "Преди 2 месеца бях на 100", time: "18:35", date: "преди 3 дни", isOutgoing: false },
      { text: "Плато пробито", time: "18:35", date: "преди 3 дни", isOutgoing: false },
      { text: "ДА! Силата се връща! Сега само напред 🔥", time: "18:38", date: "преди 3 дни", isOutgoing: true }
    ]
  },
  {
    id: 5,
    name: "Петър",
    age: 52,
    avatar: "/funnel/petar-avatar.jpg",
    messages: [
      { text: "Ходих на личния ми лекар да си проверя кръвните", time: "16:22", date: "преди 4 дни", isOutgoing: false, showAvatar: true },
      { text: "Като видя резултатите попита какво правя", time: "16:23", date: "преди 4 дни", isOutgoing: false },
      { text: "Каза му за Testograph", time: "16:23", date: "преди 4 дни", isOutgoing: false },
      { text: "Каза че резултатите са невероятни за възрастта ми", time: "16:24", date: "преди 4 дни", isOutgoing: false },
      { text: "Легендарен напредък! 👑", time: "16:27", date: "преди 4 дни", isOutgoing: true, hasAttachment: true }
    ],
    labResults: { before: 11.0, after: 26.0, increase: "+136%" },
    doctorName: "Д-р Георгиева"
  },
  {
    id: 6,
    name: "Стоян",
    age: 29,
    avatar: "/funnel/stoyan-avatar.jpg",
    messages: [
      { text: "Платих 97лв за протокола", time: "20:15", date: "вчера", isOutgoing: false, showAvatar: true },
      { text: "Направо най-доброто вложение тази година", time: "20:16", date: "вчера", isOutgoing: false },
      { text: "Освен спортното хранене на месец всичко е по-евтино", time: "20:16", date: "вчера", isOutgoing: false },
      { text: "А ефекта е 10 пъти по-силен", time: "20:17", date: "вчера", isOutgoing: false },
      { text: "Това е мощта на истинския тестостерон! 💪", time: "20:20", date: "вчера", isOutgoing: true }
    ]
  }
];

export const ViberProofGrid = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'start',
    slidesToScroll: 1
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 75) {
      scrollNext();
    }
    if (touchStart - touchEnd < -75) {
      scrollPrev();
    }
  };

  return (
    <div className="relative w-full max-w-full overflow-hidden">
      {/* Carousel Container */}
      <div
        className="overflow-hidden w-full max-w-full"
        ref={emblaRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex gap-4 md:gap-8">
          {chatProofs.map((chat) => (
            <div
              key={chat.id}
              className="flex-[0_0_calc(100%-2rem)] md:flex-[0_0_calc(33.333%-22px)] min-w-0 flex-shrink-0"
            >
              {/* Viber Chat Card */}
              <div className="bg-gradient-to-b from-[#E5DDD5] to-[#D9CFC9] rounded-xl p-3 shadow-lg hover:shadow-xl transition-all duration-300 max-w-full min-h-[580px] max-h-[580px] flex flex-col">
                {/* Chat Header */}
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-black/10">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#7360f2] to-[#9c8ef9] flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {chat.avatar.startsWith('/') ? (
                      <img
                        src={chat.avatar}
                        alt={chat.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xl">{chat.avatar}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-xs truncate">{chat.name}, {chat.age}г.</p>
                    <p className="text-xs text-gray-600">{chat.messages[0].date}</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="space-y-0.5 max-w-full overflow-y-auto flex-1">
                  {chat.messages.map((message, idx) => (
                    <div key={idx} className="max-w-full">
                      <ViberMessage
                        message={message.text}
                        timestamp={`${message.date}, ${message.time}`}
                        isOutgoing={message.isOutgoing}
                        showAvatar={message.showAvatar}
                        name={!message.isOutgoing ? chat.name : undefined}
                        avatar={!message.isOutgoing ? chat.avatar : undefined}
                      />
                      {message.hasAttachment && chat.labResults && (
                        <div className="mt-1">
                          <ViberPhotoAttachment
                            type="lab"
                            labResults={chat.labResults}
                            timestamp={`${message.date}, ${message.time}`}
                            doctorName={chat.doctorName}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Unified Navigation - Desktop & Mobile */}
      <div className="flex items-center justify-center gap-4 mt-8">
        <button
          onClick={scrollPrev}
          className="w-12 h-12 rounded-full bg-primary/10 hover:bg-primary/20 border border-primary/30 flex items-center justify-center transition-all duration-300 hover:scale-110"
          aria-label="Previous testimonials"
        >
          <ChevronLeft className="w-6 h-6 text-primary" />
        </button>

        {/* Dots Indicator */}
        <div className="flex gap-2">
          {chatProofs.map((_, index) => (
            <button
              key={index}
              onClick={() => emblaApi && emblaApi.scrollTo(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === selectedIndex
                  ? 'bg-primary w-8'
                  : 'bg-primary/30 hover:bg-primary/50'
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>

        <button
          onClick={scrollNext}
          className="w-12 h-12 rounded-full bg-primary/10 hover:bg-primary/20 border border-primary/30 flex items-center justify-center transition-all duration-300 hover:scale-110"
          aria-label="Next testimonials"
        >
          <ChevronRight className="w-6 h-6 text-primary" />
        </button>
      </div>
      <p className="text-center mt-4 text-sm text-muted-foreground">{selectedIndex + 1} / {chatProofs.length}</p>
    </div>
  );
};
