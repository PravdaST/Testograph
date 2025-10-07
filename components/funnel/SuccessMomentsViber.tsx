import { ViberMessage } from "./ViberMessage";
import { ViberPhotoAttachment } from "./ViberPhotoAttachment";

interface SuccessMoment {
  customerName: string;
  avatar: string;
  messages: Array<{
    text: string;
    time: string;
    date: string;
    isOutgoing: boolean;
    showAvatar?: boolean;
    hasAttachment?: boolean;
  }>;
  labResults?: {
    before: number;
    after: number;
    increase: string;
  };
  doctorName?: string;
}

interface SuccessMomentsViberProps {
  tier: "premium" | "regular" | "digital";
}

const premiumMoments: SuccessMoment[] = [
  {
    customerName: "Димитър В.",
    avatar: "/funnel/martin-avatar.jpg",
    messages: [
      { text: "Брате, това наистина работи. Жена ми ме гледа по различен начин, усещам се като на 25.", time: "19:23", date: "14 дни", isOutgoing: false, showAvatar: true },
      { text: "Казахме ти! Само 14 дни. Представи си след 90 дни 💪", time: "19:47", date: "14 дни", isOutgoing: true },
      { text: "Купувам още 3 бутилки веднага. Няма да спирам.", time: "19:52", date: "14 дни", isOutgoing: false, showAvatar: true }
    ]
  },
  {
    customerName: "Кирил М.",
    avatar: "/funnel/georgi-avatar.jpg",
    messages: [
      { text: "Честно казано скептичен съм... но решавам да пробвам", time: "10:15", date: "Ден 1", isOutgoing: false, showAvatar: true },
      { text: "Разбираме. Просто следвай плана 30 дни и ще видиш 💪", time: "10:42", date: "Ден 1", isOutgoing: true },
      { text: "Имах грешка да се съмнявам. Резултатите са там - +140% тестостерон.", time: "21:18", date: "Ден 30", isOutgoing: false, showAvatar: true, hasAttachment: true }
    ],
    labResults: { before: 288, after: 691, increase: "+140%" },
    doctorName: "Иван Петров"
  }
];

const regularMoments: SuccessMoment[] = [
  {
    customerName: "Стоян Р.",
    avatar: "/funnel/ivan-avatar.jpg",
    messages: [
      { text: "Енергията се върна след само 7 дни. Сутрин ставам без мъка.", time: "08:42", date: "7 дни", isOutgoing: false, showAvatar: true },
      { text: "Точно така! Първата седмица е ключова 💪", time: "09:15", date: "7 дни", isOutgoing: true },
      { text: "Продължавам. Искам още бутилки.", time: "18:23", date: "14 дни", isOutgoing: false, showAvatar: true }
    ]
  }
];

const digitalMoments: SuccessMoment[] = [
  {
    customerName: "Любен Г.",
    avatar: "/funnel/martin-avatar.jpg",
    messages: [
      { text: "Планът е много добър. Точно знам какво да правя всеки ден.", time: "15:42", date: "3 дни", isOutgoing: false, showAvatar: true },
      { text: "Това е целта - никакви загадки, само действие 💪", time: "16:05", date: "3 дни", isOutgoing: true },
      { text: "Виждам промяна след 2 седмици. Следвам всичко по плана.", time: "20:18", date: "14 дни", isOutgoing: false, showAvatar: true }
    ]
  }
];

export const SuccessMomentsViber = ({ tier }: SuccessMomentsViberProps) => {
  const moments = tier === "premium" ? premiumMoments : tier === "regular" ? regularMoments : digitalMoments;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Реални разговори с клиенти
        </h2>
        <p className="text-base text-muted-foreground">
          Не само продавам - подкрепям всеки клиент докрай
        </p>
      </div>

      {moments.map((moment, index) => (
        <div key={index} className="bg-gradient-to-b from-[#E5DDD5] to-[#D9CFC9] rounded-xl p-3 space-y-1">
          {moment.messages.map((message, msgIndex) => (
            <div key={msgIndex}>
              <ViberMessage
                message={message.text}
                timestamp={`${message.date}, ${message.time}`}
                isOutgoing={message.isOutgoing}
                showAvatar={message.showAvatar}
                name={!message.isOutgoing ? moment.customerName : undefined}
                avatar={!message.isOutgoing ? moment.avatar : undefined}
              />
              {message.hasAttachment && moment.labResults && (
                <ViberPhotoAttachment
                  type="lab"
                  labResults={moment.labResults}
                  timestamp={`${message.date}, ${message.time}`}
                  doctorName={moment.doctorName}
                />
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
