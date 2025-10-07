import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AutoAdvanceIndicator } from "./AutoAdvanceIndicator";
import { AnimatedCounter } from "./AnimatedCounter";
import { ScarcityBanner } from "./ScarcityBanner";
import { ViberMessage } from "./ViberMessage";
import { ViberPhotoAttachment } from "./ViberPhotoAttachment";

interface Step3aProofProps {
  onProceed: () => void;
  userData?: any;
}

const testimonials = [
  {
    id: 1,
    name: "Мартин К.",
    age: 38,
    role: "Мениджър",
    avatar: "/funnel/martin-avatar.jpg",
    messages: [
      { day: 1, text: "Започвам днес. Честно казано съм скептичен 😕 Но нищо друго не проработи...", time: "08:15", date: "1 март", isOutgoing: false, showAvatar: true },
      { day: 1, text: "Разбираме те. Първите дни са ключови - следвай точно плана и ще видиш промяна 💪", time: "08:47", date: "1 март", isOutgoing: true },
      { day: 7, text: "Невероятно! Енергията се върна! 💪 Събуждам се без будилник. Усещам разликата.", time: "07:42", date: "8 март", isOutgoing: false, showAvatar: true },
      { day: 7, text: "Точно така! Това е тестостеронът. Продължавай силно! 🔥", time: "09:18", date: "8 март", isOutgoing: true },
      { day: 14, text: "Жена ми забеляза! Каза 'какво ти стана?' 😂 Без да й казвам нищо!", time: "19:23", date: "15 март", isOutgoing: false, showAvatar: true },
      { day: 14, text: "Отлично! Виждаш ли колко бързо стана? 😎", time: "19:41", date: "15 март", isOutgoing: true, hasAttachment: true },
      { day: 30, text: "След 30 дни чувствам се като на 25. Благодаря ви! 🔥", time: "21:11", date: "30 март", isOutgoing: false, showAvatar: true },
      { day: 30, text: "Легендарен напредък! Гордеем се с теб 💪", time: "21:34", date: "30 март", isOutgoing: true }
    ],
    labResults: { before: 288, after: 691, increase: "+140%" },
    doctorName: "Иван Петров"
  },
  {
    id: 2,
    name: "Георги П.",
    age: 42,
    role: "Собственик на бизнес",
    avatar: "/funnel/georgi-avatar.jpg",
    messages: [
      { day: 1, text: "Надявам се да проработи... Съм изтощен от години 😓", time: "22:34", date: "3 март", isOutgoing: false, showAvatar: true },
      { day: 1, text: "Ще проработи ако слушаш. Дай ни 7 дни - ще усетиш 💪", time: "23:12", date: "3 март", isOutgoing: true },
      { day: 7, text: "Страхотно! Тренирах преди работа! Не съм го правил от 10 години! 💪", time: "06:12", date: "10 март", isOutgoing: false, showAvatar: true },
      { day: 7, text: "ДА! Силата се връща! Сега само напред 🔥", time: "07:45", date: "10 март", isOutgoing: true },
      { day: 14, text: "Жена ми каза че изглеждам по-млад 😊 Енергията е невероятна", time: "20:15", date: "17 март", isOutgoing: false, showAvatar: true },
      { day: 14, text: "Виждаш ли? Промяната е реална! 💯", time: "20:52", date: "17 март", isOutgoing: true, hasAttachment: true },
      { day: 30, text: "Продуктивността ми скочи с 200%. Работя по-малко, постигам повече 🚀", time: "18:45", date: "2 април", isOutgoing: false, showAvatar: true },
      { day: 30, text: "Това е мощта на тестостерона! Браво! 👑", time: "19:23", date: "2 април", isOutgoing: true }
    ],
    labResults: { before: 317, after: 749, increase: "+136%" },
    doctorName: "Елена Димитрова"
  },
  {
    id: 3,
    name: "Иван С.",
    age: 35,
    role: "IT специалист",
    avatar: "/funnel/ivan-avatar.jpg",
    messages: [
      { day: 1, text: "Не вярвам че ще стане... но давам си последен шанс", time: "13:22", date: "5 март", isOutgoing: false, showAvatar: true },
      { day: 1, text: "Правилно решение. Следвай плана 100% и наблюдавай 💪", time: "14:05", date: "5 март", isOutgoing: true },
      { day: 7, text: "Свалих 3кг!!! Без глад, без умора! Как е възможно? 😮", time: "09:33", date: "12 март", isOutgoing: false, showAvatar: true },
      { day: 7, text: "Тестостеронът топи мазнините! Това е само началото 🔥", time: "10:18", date: "12 март", isOutgoing: true },
      { day: 14, text: "Коремът започна да изчезва! Либидото се върна силно 🔥", time: "22:18", date: "19 март", isOutgoing: false, showAvatar: true },
      { day: 14, text: "Виждаш ли какво значи истински тестостерон? 💯", time: "08:34", date: "20 март", isOutgoing: true, hasAttachment: true },
      { day: 30, text: "11кг долу! Чувствам се като друг човек. Благодаря! 💪", time: "19:27", date: "4 април", isOutgoing: false, showAvatar: true },
      { day: 30, text: "Феноменален резултат! Продължавай така! 👑", time: "20:11", date: "4 април", isOutgoing: true }
    ],
    labResults: { before: 259, after: 634, increase: "+145%" },
    doctorName: "Мария Георгиева"
  }
];

export const Step3aProof = ({ onProceed, userData }: Step3aProofProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // Auto-forward after 22 seconds if user doesn't click
  useEffect(() => {
    const timer = setTimeout(() => {
      onProceed();
    }, 22000);

    return () => clearTimeout(timer);
  }, [onProceed]);

  // Auto-rotate every 20 seconds
  useEffect(() => {
    if (!autoRotate) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 20000);

    return () => clearInterval(interval);
  }, [autoRotate]);

  const nextTestimonial = () => {
    setAutoRotate(false);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setAutoRotate(false);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const currentTestimonial = testimonials[currentIndex];

  // Handle swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 75) {
      // Swiped left - next
      nextTestimonial();
    }

    if (touchStart - touchEnd < -75) {
      // Swiped right - prev
      prevTestimonial();
    }
  };

  return (
    <div className="min-h-[100vh] flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full space-y-4">
        {/* Header */}
        <div className="text-center">
          <p className="text-sm text-primary uppercase tracking-wide mb-2">Реална история</p>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {currentTestimonial.name}, {currentTestimonial.age} години<br />
            <span className="text-muted-foreground text-lg">{currentTestimonial.role}</span>
          </h1>
        </div>

        {/* Viber Chat Timeline */}
        <div
          className="bg-gradient-to-b from-[#E5DDD5] to-[#D9CFC9] rounded-xl p-3 space-y-1 relative"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {currentTestimonial.messages.map((message, index) => (
            <div key={index}>
              <ViberMessage
                message={message.text}
                timestamp={`${message.date}, ${message.time}`}
                isOutgoing={message.isOutgoing}
                showAvatar={message.showAvatar}
                name={!message.isOutgoing ? currentTestimonial.name : undefined}
                avatar={!message.isOutgoing ? currentTestimonial.avatar : undefined}
              />
              {message.hasAttachment && (
                <ViberPhotoAttachment
                  type="lab"
                  labResults={currentTestimonial.labResults}
                  timestamp={`${message.date}, ${message.time.split(':')[0]}:${(parseInt(message.time.split(':')[1]) + 1).toString().padStart(2, '0')}`}
                  doctorName={currentTestimonial.doctorName}
                />
              )}
            </div>
          ))}
        </div>

        {/* Carousel Dots */}
        <div className="flex justify-center gap-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setAutoRotate(false);
                setCurrentIndex(index);
              }}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex ? "w-8 bg-primary" : "w-2 bg-border"
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>

        {/* Direct Statement */}
        <p className="text-base font-bold text-center text-foreground">
          Същото ще стане с ТЕБ. Ако слушаш.
        </p>

        {/* CTA */}
        <div className="space-y-3">
          <Button
            onClick={onProceed}
            size="lg"
            className="w-full text-xl py-6 bg-gradient-to-r from-success to-emerald-600 hover:from-success/90 hover:to-emerald-600/90 font-bold shadow-xl"
          >
            Искам същото
          </Button>

          <AutoAdvanceIndicator totalSeconds={22} />
        </div>
      </div>
    </div>
  );
};
