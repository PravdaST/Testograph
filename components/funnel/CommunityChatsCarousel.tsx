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
    title: "Николай П.",
    participant2: "Марио",
    badge: "",
    accentColor: "border-red-500",
    avatarColor: "bg-red-500",
    avatarImage: "/public/funnel/petar-avatar",
    messages: [
      {
        sender: "Николай",
        message: "Марио, какво стана с теб напоследък? Миналата седмица едва те разпознах в залата.",
        timestamp: "22:34",
        isUser: true
      },
      {
        sender: "Марио",
        message: "Хаха, нищо специално.",
        timestamp: "22:35",
        isUser: false
      },
      {
        sender: "Николай",
        message: "Сериозно? Вдигаш повече от Иво сега. А той е на стероиди от поне година.",
        timestamp: "22:36",
        isUser: true
      },
      {
        sender: "Марио",
        message: "Започнах да взимам една тестостеронова добавка препоръчана от брат ми.",
        timestamp: "22:37",
        isUser: false
      },
      {
        sender: "Николай",
        message: "Е, кажи повече за тая добавка де",
        timestamp: "22:38",
        isUser: true
      },
      {
        sender: "Марио",
        message: "Даже и жената ми снощи ме пита \"какво си взел?\" 😂",
        timestamp: "22:39",
        isUser: false
      },
      {
        sender: "Николай",
        message: "Оо Прати ми линк да разгледам и аз.",
        timestamp: "22:40",
        isUser: true
      },
      {
        sender: "Марио",
        message: "Ще ти го изпратя сега. testograph.eu",
        timestamp: "22:41",
        isUser: false
      },
      {
        sender: "Марио",
        message: "shop.testograph.eu",
        timestamp: "22:41",
        isUser: false
      }
    ]
  },
  {
    id: 2,
    title: "Георги Н.",
    participant2: "Петко",
    badge: "",
    accentColor: "border-blue-500",
    avatarColor: "bg-blue-500",
    avatarImage: "/funnel/georgi-avatar.jpg",
    messages: [
      {
        sender: "Георги",
        message: "Петко, имам въпрос.",
        timestamp: "19:18",
        isUser: true
      },
      {
        sender: "Петко",
        message: "Казвай",
        timestamp: "19:19",
        isUser: false
      },
      {
        sender: "Георги",
        message: "Миналия път спомена че от месеци нямаш енергия. Какво се случи? Сега си различен човек.",
        timestamp: "19:19",
        isUser: true
      },
      {
        sender: "Петко",
        message: "Осъзнах, че проблемът е хормонален и започнах да взимам тестостерон добавки.",
        timestamp: "19:21",
        isUser: false
      },
      {
        sender: "Георги",
        message: "И какви ти бяха резултатите?",
        timestamp: "19:22",
        isUser: true
      },
      {
        sender: "Петко",
        message: "Тестостеронът ми беше 310 ng/dL преди три месеца. Сега е 680 ng/dL.",
        timestamp: "19:23",
        isUser: false
      },
      {
        sender: "Георги",
        message: "Ехе, това е впечатляващо. Доктора какво каза?",
        timestamp: "19:24",
        isUser: true
      },
      {
        sender: "Петко",
        message: "Каза ми \"Продължавай така.\" Първите две седмици почти не усетих разлика. Но после енергията ми се върна изцяло.",
        timestamp: "19:25",
        isUser: false
      },
       {
        sender: "Петко",
        message: "ама и в други области има подобрение.. 😏",
        timestamp: "19:26",
        isUser: false
      },
      {
        sender: "Петко",
        message: "Жената ми вече не ме пита дали работя твърде много. 😂 Ако искаш, мога да ти изпратя информация.",
        timestamp: "19:27",
        isUser: false
      },
      {
        sender: "Георги",
        message: "Да, изпрати ми.",
        timestamp: "19:28",
        isUser: true
      }
    ]
  },
  {
    id: 3,
    title: "Стефан И.",
    participant2: "Иван",
    badge: "",
    accentColor: "border-green-500",
    avatarColor: "bg-green-500",
    avatarImage: "/funnel/stefan-avatar.jpg",
    messages: [
      {
        sender: "Стефан",
        message: "Ванка, как си?",
        timestamp: "07:12",
        isUser: true
      },
      {
        sender: "Иван",
        message: "Супер, вече съм по-добре.",
        timestamp: "07:14",
        isUser: false
      },
      {
        sender: "Стефан",
        message: "Забелязах в залата имаш сериозен напредък.",
        timestamp: "07:15",
        isUser: true
      },
      {
        sender: "Иван",
        message: "Да след двугодишен застой. Хем ям правилно, спя добре, тренирам редовно. Нищо не се случваше.",
        timestamp: "07:17",
        isUser: false
      },
      {
        sender: "Стефан",
        message: "Е какво промени? че и аз мисля че съм застой",
        timestamp: "07:18",
        isUser: true
      },
      {
        sender: "Иван",
        message: "Проверих нивата на тестостерона си. Оказа се, че са доста ниски за възрастта ми.",
        timestamp: "07:19",
        isUser: false
      },
      {
        sender: "Стефан",
        message: "И започна ли инжекции?",
        timestamp: "07:20",
        isUser: true
      },
      {
        sender: "Иван",
        message: "Не, добавки само. Природни съставки - ашваганда, цинк, витамин D3.",
        timestamp: "07:21",
        isUser: false
      },
      {
        sender: "Иван",
        message: "И за шест седмици качих 8 кг мускулна маса.",
        timestamp: "07:23",
        isUser: false
      },
       {
        sender: "Стефан",
        message: "Впечатляващо. Можеш ли да ми изпратиш информация?",
        timestamp: "07:24",
        isUser: true
      },
      {
        sender: "Иван",
        message: "testograph.eu Ако имаш въпроси - пиши ми.",
        timestamp: "07:25",
        isUser: false
      }
    ]
  },
  {
    id: 4,
    title: "Кристиян Д.",
    participant2: "Владо",
    badge: "",
    accentColor: "border-yellow-500",
    avatarColor: "bg-yellow-500",
    avatarImage: "/funnel/kristiyan-avatar.jpg",
    messages: [
      {
        sender: "Кристиян",
        message: "Владо, какво стана при доктора?",
        timestamp: "14:47",
        isUser: true
      },
      {
        sender: "Владо",
        message: "Сравнявахме резултатите от преди 3 месеца.",
        timestamp: "14:49",
        isUser: false
      },
      {
        sender: "Кристиян",
        message: "И?",
        timestamp: "14:50",
        isUser: true
      },
      {
        sender: "Владо",
        message: "Тестостеронът ми е скочил от 310 на 690 ng/dL.",
        timestamp: "14:51",
        isUser: false
      },
      {
        sender: "Кристиян",
        message: "Уооу и той кво каза като видя разликата?",
        timestamp: "14:52",
        isUser: true
      },
      {
        sender: "Владо",
        message: "\"Какво правихте различно през последните месеци?\" Обясних му за добавките които взимам.",
        timestamp: "14:53",
        isUser: false
      },
      {
        sender: "Кристиян",
        message: "И какво каза той?",
        timestamp: "14:54",
        isUser: true
      },
      {
        sender: "Владо",
        message: "\"Ако работи, продължавайте.\" После добави нещо интересно.",
        timestamp: "14:55",
        isUser: false
      },
      {
        sender: "Кристиян",
        message: "Какво?",
        timestamp: "14:56",
        isUser: true
      },
      {
        sender: "Владо",
        message: "Каза, че много от пациентите му над 40 години имат ниски нива.",
        timestamp: "14:57",
        isUser: false
      },
      {
        sender: "Владо",
        message: "И ме помоли за линка на сайта?",
        timestamp: "14:58",
        isUser: true
      }
    ]
  },
  {
        id: 5,
        title: "Десислава К.",
        participant2: "Мария",
        badge: "",
        accentColor: "border-pink-500",
        avatarColor: "bg-pink-500",
        avatarImage: "/funnel/desislava-avatar.jpg",
        messages: [
          {
            sender: "Десислава",
            message: "Миме, може ли съвет? С мъжа ми нещата в спалнята изобщо не вървят от месеци...",
            timestamp: "21:50",
            isUser: true
          },
    {
              sender: "Мария",
              message: "Защо бе какво става ?",
              timestamp: "21:51",
              isUser: false
            },
      {
                sender: "Десислава",
                message: "Ами лягаме си, аз го гушкам а той... седи и нищо",
                timestamp: "21:50",
                isUser: true
              },
          {
            sender: "Мария",
            message: "Хммм,знаеш ли имаше такъв период. Но се Оказа , че тестостеронът му е паднал много.",
            timestamp: "21:51",
            isUser: false
          },
          {
            sender: "Десислава",
            message: "Наистина? И какво направихте?",
            timestamp: "21:52",
            isUser: true
          },
    {
              sender: "Мария",
              message: "Ами поръчах му едни добавки TestoUP и му казах да ги пие.",
              timestamp: "21:51",
              isUser: false
            },
          {
            sender: "Мария",
            message: "Не вярвах, но след месец беше като нов мъж! 😊",
            timestamp: "21:53",
            isUser: false
          },
          {
            sender: "Десислава",
            message: "Прати ми линк, моля тее!",
            timestamp: "21:54",
            isUser: true
          },
          {
            sender: "Мария",
            message: "shop.testograph.eu",
            timestamp: "21:55",
            isUser: false
            }
        ]
    },

    {
    id: 6,
    title: "Димитър В.",
    participant2: "Павел",
    badge: "",
    accentColor: "border-indigo-500",
    avatarColor: "bg-indigo-500",
    avatarImage: "/funnel/dimitar-avatar.jpg",
    messages: [
      {
        sender: "Димитър",
        message: "Абе нали имаш опит тестостерон добавки?",
        timestamp: "11:23",
        isUser: true
      },
      {
        sender: "Павел",
        message: "Да, взимам от два месеца. Защо питаш?",
        timestamp: "11:25",
        isUser: false
      },
      {
        sender: "Димитър",
        message: "Има ли ефект? Или е маркетинг измама?",
        timestamp: "11:26",
        isUser: true
      },
      {
        sender: "Павел",
        message: "Ами тая добавка TestoUp дето аз пия има, Ашваганда - повишава тестостерона с 15-20%. Цинк - минерал за производството. Витамин D3.",
        timestamp: "11:28",
        isUser: false
      },
      {
        sender: "Димитър",
        message: "Проверявал ли си нивата си преди и след?",
        timestamp: "11:29",
        isUser: true
      },
      {
        sender: "Павел",
        message: "Да, разбира се. Преди: 310 ng/dL. След три месеца: 680 ng/dL.",
        timestamp: "11:31",
        isUser: false
      },
      {
        sender: "Димитър",
        message: "Впечатляващ резултат.",
        timestamp: "11:32",
        isUser: true
      },
      {
        sender: "Павел",
        message: " Принципно тестостеронът естествено започва да спада след 30 години. Около 1-2% годишно.",
        timestamp: "11:34",
        isUser: false
      },
      {
        sender: "Димитър",
        message: "Това обяснява много неща. От къде мога да взема и аз?",
        timestamp: "11:35",
        isUser: true
      },
      {
        sender: "Павел",
        message: "Да, ето: shop.testograph.eu",
        timestamp: "11:36",
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
