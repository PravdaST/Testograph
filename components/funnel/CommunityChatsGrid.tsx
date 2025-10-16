"use client";

import { MessageCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ChatMessage {
  sender: string;
  message: string;
  timestamp: string;
  isUser?: boolean;
}

interface ChatConversation {
  id: number;
  title: string;
  badge?: string;
  messages: ChatMessage[];
  bgGradient: string;
}

const conversations: ChatConversation[] = [
  {
    id: 1,
    title: "Георги В., 34г - Либидо",
    badge: "След 3 седмици",
    bgGradient: "from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20",
    messages: [
      {
        sender: "Георги В.",
        message: "Брато... не знам как да ти кажа, но... жена ми забеляза 😅",
        timestamp: "10:34",
        isUser: true
      },
      {
        sender: "Експерт",
        message: "Хаха, това е нормално! Какво точно забеляза? 😊",
        timestamp: "10:35"
      },
      {
        sender: "Георги В.",
        message: "Ами... че съм по-активен. Много по-активен. Разбираш ли 😏 Не съм бил така от години. Мислех че просто съм остарял",
        timestamp: "10:36",
        isUser: true
      },
      {
        sender: "Експерт",
        message: "Не си остарял, просто хормоните ти бяха на дъното. Радвам се че работи! 💪",
        timestamp: "10:37"
      }
    ]
  },
  {
    id: 2,
    title: "Мартин С., 41г - Енергия",
    badge: "След 2 седмици",
    bgGradient: "from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20",
    messages: [
      {
        sender: "Мартин С.",
        message: "Бате, днес станах в 6 без будилник. В СЪБОТА. Какво ми направихте? 😂",
        timestamp: "06:47",
        isUser: true
      },
      {
        sender: "Експерт",
        message: "Това е страхотно! Как се чувстваш?",
        timestamp: "08:12"
      },
      {
        sender: "Мартин С.",
        message: "Като на 25. Шефът ми попита вчера дали съм сменил работа, защото съм много по-енергичен на срещите 😄 Преди спях с очи отворени до обяд",
        timestamp: "08:15",
        isUser: true
      }
    ]
  },
  {
    id: 3,
    title: "Николай Д., 29г - Фитнес",
    badge: "След 6 седмици",
    bgGradient: "from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20",
    messages: [
      {
        sender: "Николай Д.",
        message: "Брат, качих 8 кг чиста мускулна маса за 6 седмици. ОСЕМ КИЛА.",
        timestamp: "14:22",
        isUser: true
      },
      {
        sender: "Експерт",
        message: "Супер резултат! Как тренираш?",
        timestamp: "14:25"
      },
      {
        sender: "Николай Д.",
        message: "Със силовия план от пакета. Преди бях на плато 2 години. Сега вдигам 20 кг повече на bench press. Треньорът ми попита какво взимам 😂 Казах му за TestoUP",
        timestamp: "14:27",
        isUser: true
      },
      {
        sender: "Николай Д.",
        message: "[Прикачил снимка: Before/After]",
        timestamp: "14:28",
        isUser: true
      }
    ]
  },
  {
    id: 4,
    title: "Петър А., 38г - Лаборатория",
    badge: "След 90 дни",
    bgGradient: "from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20",
    messages: [
      {
        sender: "Петър А.",
        message: "Току-що взех резултатите от кръвната. Шокиран съм",
        timestamp: "11:43",
        isUser: true
      },
      {
        sender: "Експерт",
        message: "Споделяй! Какви са стойностите?",
        timestamp: "11:45"
      },
      {
        sender: "Петър А.",
        message: "Тестостерон от 290 ng/dl на 680 ng/dl за 3 месеца. Доктора ме попита дали съм на терапия 😅 Показах му съставките, каза ми 'продължавай, работи'",
        timestamp: "11:47",
        isUser: true
      },
      {
        sender: "Петър А.",
        message: "Естроген също се нормализира. Най-добре се чувствам от 10 години насам",
        timestamp: "11:48",
        isUser: true
      }
    ]
  },
  {
    id: 5,
    title: "Иван М., 36г - Взаимоотношения",
    badge: "След 4 седмици",
    bgGradient: "from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/20",
    messages: [
      {
        sender: "Иван М.",
        message: "Жена ми ме попита вчера 'какво стана с теб?' 😊",
        timestamp: "20:15",
        isUser: true
      },
      {
        sender: "Експерт",
        message: "Хаха, в добър смисъл, надявам се? 😄",
        timestamp: "20:18"
      },
      {
        sender: "Иван М.",
        message: "Много добър. Каза ми 'върна си се старата енергия, старата увереност... като преди да се оженим'. Това удари право в сърцето ❤️",
        timestamp: "20:19",
        isUser: true
      },
      {
        sender: "Иван М.",
        message: "Последните години бях като зомби. Тя си мислеше че не я обичам. Просто нямах енергия... за нищо. Сега сме като преди 10 години",
        timestamp: "20:21",
        isUser: true
      }
    ]
  }
];

export function CommunityChatsGrid() {
  return (
    <section className="py-12 md:py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4 text-sm">
            <MessageCircle className="w-4 h-4 mr-2" />
            От VIP Telegram Общността
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Реални Разговори. Реални Резултати.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Над 3,000 мъже споделят своя напредък всеки ден. Ето какво пишат в общността:
          </p>
        </div>

        {/* Chat Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {conversations.map((conversation) => (
            <Card
              key={conversation.id}
              className={`p-5 bg-gradient-to-br ${conversation.bgGradient} border-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
            >
              {/* Chat Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-sm text-foreground/90">
                    {conversation.title}
                  </h3>
                  {conversation.badge && (
                    <Badge variant="outline" className="mt-1 text-xs">
                      {conversation.badge}
                    </Badge>
                  )}
                </div>
                <MessageCircle className="w-5 h-5 text-muted-foreground/50" />
              </div>

              {/* Chat Messages */}
              <div className="space-y-3">
                {conversation.messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3 py-2 ${
                        msg.isUser
                          ? 'bg-primary text-primary-foreground rounded-br-sm'
                          : 'bg-white dark:bg-slate-800 text-foreground rounded-bl-sm shadow-sm'
                      }`}
                    >
                      <p className="text-xs font-semibold mb-1 opacity-90">
                        {msg.sender}
                      </p>
                      <p className="text-sm leading-relaxed">
                        {msg.message}
                      </p>
                      <p className={`text-xs mt-1 ${
                        msg.isUser
                          ? 'text-primary-foreground/60'
                          : 'text-muted-foreground'
                      }`}>
                        {msg.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-10">
          <p className="text-muted-foreground text-sm">
            Искаш да бъдеш част от общността? <span className="font-bold text-foreground">Включена във всеки пакет.</span>
          </p>
        </div>
      </div>
    </section>
  );
}
