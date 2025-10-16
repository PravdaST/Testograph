"use client";

import { MessageCircle, Users, Shield, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";

interface ChatMessage {
  sender: string;
  message: string;
  timestamp: string;
  isUser?: boolean;
}

interface ChatConversation {
  id: number;
  title: string;
  participant2: string; // The other person in conversation
  badge?: string;
  messages: ChatMessage[];
  accentColor: string;
  avatarColor: string;
  avatarImage: string;
}

const conversations: ChatConversation[] = [
  {
    id: 1,
    title: "Георги В.",
    participant2: "Иван",
    badge: "",
    accentColor: "border-violet-500",
    avatarColor: "bg-violet-500",
    avatarImage: "/funnel/georgi-avatar.jpg",
    messages: [
      {
        sender: "Иван",
        message: "Бате какво стана с теб? 😄",
        timestamp: "22:34",
        isUser: false
      },
      {
        sender: "Георги",
        message: "Какво имаш предвид?",
        timestamp: "22:35",
        isUser: true
      },
      {
        sender: "Иван",
        message: "Ами миналата седмица каза че нямаш желание. Сега излъчваш друга енергия",
        timestamp: "22:36",
        isUser: false
      },
      {
        sender: "Георги",
        message: "Хаха забеляза се значи",
        timestamp: "22:37",
        isUser: true
      },
      {
        sender: "Георги",
        message: "Започнах да взимам TestoUP преди 3 седмици",
        timestamp: "22:37",
        isUser: true
      },
      {
        sender: "Георги",
        message: "Жена ми вчера се оплака че съм прекалено активен 😂",
        timestamp: "22:38",
        isUser: true
      },
      {
        sender: "Иван",
        message: "Браво бе! Изпрати ми линка",
        timestamp: "22:39",
        isUser: false
      }
    ]
  },
  {
    id: 2,
    title: "Мартин С.",
    participant2: "Мария",
    badge: "",
    accentColor: "border-orange-500",
    avatarColor: "bg-orange-500",
    avatarImage: "/funnel/martin-avatar.jpg",
    messages: [
      {
        sender: "Мария",
        message: "Любов, вече 2 седмици ставаш преди мен 😳",
        timestamp: "07:15",
        isUser: false
      },
      {
        sender: "Мартин",
        message: "Хаха да, даже не знам какво стана",
        timestamp: "07:16",
        isUser: true
      },
      {
        sender: "Мария",
        message: "Преди месец до обяд спеше. Сега 6 сутринта си пълен с енергия",
        timestamp: "07:17",
        isUser: false
      },
      {
        sender: "Мартин",
        message: "TestoUP капсулите които ми препоръча брат ми",
        timestamp: "07:18",
        isUser: true
      },
      {
        sender: "Мартин",
        message: "Работят 😊",
        timestamp: "07:18",
        isUser: true
      },
      {
        sender: "Мария",
        message: "Забелязвам ❤️ Върна ми се мъжа ми",
        timestamp: "07:19",
        isUser: false
      }
    ]
  },
  {
    id: 3,
    title: "Николай Д.",
    participant2: "Кристиян",
    badge: "",
    accentColor: "border-blue-500",
    avatarColor: "bg-blue-500",
    avatarImage: "/funnel/avatar-extra1.jpg",
    messages: [
      {
        sender: "Николай",
        message: "Кристиян гледай",
        timestamp: "19:22",
        isUser: true
      },
      {
        sender: "Николай",
        message: "[снимка before/after]",
        timestamp: "19:22",
        isUser: true
      },
      {
        sender: "Кристиян",
        message: "Уаааа бате!!! Това за колко време е?",
        timestamp: "19:24",
        isUser: false
      },
      {
        sender: "Николай",
        message: "6 седмици 💪",
        timestamp: "19:25",
        isUser: true
      },
      {
        sender: "Кристиян",
        message: "Не може! Какво взе?",
        timestamp: "19:26",
        isUser: false
      },
      {
        sender: "Николай",
        message: "TestoUP + твоята програма. Бях на плато 2 години бе",
        timestamp: "19:27",
        isUser: true
      },
      {
        sender: "Николай",
        message: "Bench от 80 на 100кг",
        timestamp: "19:28",
        isUser: true
      },
      {
        sender: "Кристиян",
        message: "Това е невероятно. Утре ми кажи всички детайли",
        timestamp: "19:29",
        isUser: false
      }
    ]
  },
  {
    id: 4,
    title: "Петър А.",
    participant2: "Димо",
    badge: "",
    accentColor: "border-green-500",
    avatarColor: "bg-green-500",
    avatarImage: "/funnel/petar-avatar.jpg",
    messages: [
      {
        sender: "Димо",
        message: "Какво стана с кръвните?",
        timestamp: "16:12",
        isUser: false
      },
      {
        sender: "Петър",
        message: "Братле... шокиран съм",
        timestamp: "16:13",
        isUser: true
      },
      {
        sender: "Петър",
        message: "Преди 3 месеца тестостерон 290",
        timestamp: "16:14",
        isUser: true
      },
      {
        sender: "Петър",
        message: "Сега 680 🚀",
        timestamp: "16:14",
        isUser: true
      },
      {
        sender: "Димо",
        message: "КАКВО?! 😱",
        timestamp: "16:15",
        isUser: false
      },
      {
        sender: "Петър",
        message: "TestoUP. Докторът пита какво правя",
        timestamp: "16:16",
        isUser: true
      },
      {
        sender: "Димо",
        message: "И как се чувстваш?",
        timestamp: "16:17",
        isUser: false
      },
      {
        sender: "Петър",
        message: "Като на 25 💪 Благодаря че ми го препоръча",
        timestamp: "16:18",
        isUser: true
      }
    ]
  },
  {
    id: 5,
    title: "Иван М.",
    participant2: "Ели",
    badge: "",
    accentColor: "border-pink-500",
    avatarColor: "bg-pink-500",
    avatarImage: "/funnel/ivan-avatar.jpg",
    messages: [
      {
        sender: "Ели",
        message: "Любов ти си различен напоследък",
        timestamp: "21:34",
        isUser: false
      },
      {
        sender: "Иван",
        message: "В добър смисъл се надявам? 😊",
        timestamp: "21:35",
        isUser: true
      },
      {
        sender: "Ели",
        message: "Много добър. Върна ми се мъжа ми ❤️",
        timestamp: "21:36",
        isUser: false
      },
      {
        sender: "Иван",
        message: "TestoUP капсулите работят значи",
        timestamp: "21:37",
        isUser: true
      },
      {
        sender: "Ели",
        message: "И как! Като преди да се оженим си",
        timestamp: "21:38",
        isUser: false
      },
      {
        sender: "Иван",
        message: "Толкова ми хубаво стана като го чух 😊",
        timestamp: "21:39",
        isUser: true
      },
      {
        sender: "Ели",
        message: "Обичам те ❤️",
        timestamp: "21:40",
        isUser: false
      }
    ]
  }
];

export function CommunityChatsCarousel() {
  return (
    <section className="py-8 md:py-12 px-4 bg-[#0F1419]">
      <div className="max-w-6xl mx-auto">
        {/* Telegram Screenshot Title */}
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 text-white">
            Какво си пишат клиентите
          </h2>
          <p className="text-gray-400 text-sm">
            Реални разговори от Telegram групата
          </p>
        </div>

        {/* Chat Carousel */}
        <Carousel
          opts={{
            loop: true,
            align: "start",
          }}
          plugins={[
            Autoplay({
              delay: 5000,
              stopOnInteraction: true,
            }),
          ]}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {conversations.map((conversation) => (
              <CarouselItem key={conversation.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                <div
                  className="p-4 bg-[#1C2733] rounded-lg shadow-2xl border border-[#2B3E50]"
                >
                  {/* Chat Messages */}
                  <div className="space-y-3">
                    {conversation.messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex gap-2 ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                      >
                        {/* Avatar - Only for non-user messages */}
                        {!msg.isUser && (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-1">
                            {msg.sender[0]}
                          </div>
                        )}

                        <div
                          className={`max-w-[85%] rounded-2xl px-3 py-2 ${
                            msg.isUser
                              ? 'bg-[#2B5278] text-white rounded-br-sm'
                              : 'bg-white text-gray-900 rounded-bl-sm shadow-sm'
                          }`}
                        >
                          {msg.message === "[снимка before/after]" ? (
                            <div className="mt-1">
                              <Image
                                src="/success-stories/success-1.png"
                                alt="Before and After"
                                width={240}
                                height={240}
                                className="rounded-lg object-cover"
                              />
                            </div>
                          ) : (
                            <p className="text-sm leading-relaxed">
                              {msg.message}
                            </p>
                          )}
                          <p className={`text-xs mt-1 ${
                            msg.isUser
                              ? 'text-white/60'
                              : 'text-gray-500'
                          }`}>
                            {msg.timestamp}
                          </p>
                        </div>

                        {/* Avatar - Only for user messages */}
                        {msg.isUser && (
                          <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 mt-1">
                            <Image
                              src={conversation.avatarImage}
                              alt={msg.sender}
                              width={32}
                              height={32}
                              className="object-cover w-full h-full"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex" />
          <CarouselNext className="hidden md:flex" />
        </Carousel>

        {/* Bottom CTA */}
        <div className="text-center mt-10">
          <p className="text-gray-400 text-sm">
            Искаш в групата? <span className="font-bold text-white">Влизаш веднага след поръчка.</span>
          </p>
        </div>
      </div>
    </section>
  );
}
