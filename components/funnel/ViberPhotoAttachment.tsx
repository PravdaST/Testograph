import { AnimatedCounter } from "./AnimatedCounter";

interface ViberPhotoAttachmentProps {
  type: "lab" | "progress";
  labResults?: {
    before: number;
    after: number;
    increase: string;
  };
  timestamp: string;
  doctorName?: string;
}

export const ViberPhotoAttachment = ({
  type,
  labResults,
  timestamp,
  doctorName = "Лиляна Каврькова"
}: ViberPhotoAttachmentProps) => {
  if (type === "progress") {
    return (
      <div className="px-3 pb-2">
        <div className="bg-white rounded-xl p-3 shadow-sm inline-block">
          <div className="space-y-2">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
              <span className="text-lg">📷</span>
              <p className="text-xs font-semibold text-gray-700">Progress Photo</p>
            </div>
            <div className="w-48 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
              <p className="text-4xl">💪</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 mt-1 ml-2">
          <p className="text-xs text-gray-500">{timestamp}</p>
          <span className="text-xs text-blue-500">✓✓</span>
        </div>
      </div>
    );
  }

  // Lab test type - create realistic Bulgarian lab document
  if (!labResults) return null;

  return (
    <div className="px-3 pb-2">
      <div className="bg-white rounded-lg shadow-md inline-block max-w-[280px] overflow-hidden border border-gray-300">
        {/* Lab Header */}
        <div className="bg-gray-100 border-b-2 border-gray-400 px-2 py-1">
          <div className="flex justify-between items-center text-[9px]">
            <span className="font-semibold">27.06.2025</span>
            <span className="font-semibold">ID: 2412613</span>
          </div>
        </div>

        {/* Patient Info */}
        <div className="px-2 py-1 text-[8px] border-b border-gray-300">
          <div className="flex gap-2">
            <span className="text-gray-600">Лекуващ лекар:</span>
            <span className="font-medium">{doctorName}</span>
          </div>
        </div>

        {/* Hormones Section */}
        <div className="px-2 py-1">
          <div className="bg-gray-200 px-1 py-0.5 mb-1">
            <p className="text-[9px] font-bold">Хормони/Hormones</p>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-4 gap-1 text-[7px] font-semibold border-b border-gray-300 pb-0.5 mb-1">
            <div className="col-span-1">Име на теста</div>
            <div>Резултат</div>
            <div>Единици</div>
            <div>Референтни стойности</div>
          </div>

          {/* Testosterone Row - BEFORE */}
          <div className="grid grid-cols-4 gap-1 text-[7px] mb-1 bg-red-50 px-1 py-0.5 rounded">
            <div className="col-span-1 font-medium">Тестостерон</div>
            <div className="font-bold text-red-600">
              <AnimatedCounter from={0} to={labResults.before} duration={800} decimals={1} />
            </div>
            <div className="text-gray-600">nmol/L</div>
            <div className="text-gray-600">8.6 - 29</div>
          </div>

          {/* Arrow indicator */}
          <div className="text-center text-purple-600 text-sm my-1">↓</div>

          {/* Testosterone Row - AFTER */}
          <div className="grid grid-cols-4 gap-1 text-[7px] mb-1 bg-green-50 px-1 py-0.5 rounded">
            <div className="col-span-1 font-medium">Тестостерон</div>
            <div className="font-bold text-green-600">
              <AnimatedCounter from={0} to={labResults.after} duration={1200} decimals={1} />
            </div>
            <div className="text-gray-600">nmol/L</div>
            <div className="text-gray-600">8.6 - 29</div>
          </div>

          {/* Other hormones for authenticity */}
          <div className="grid grid-cols-4 gap-1 text-[7px] mb-0.5 opacity-50">
            <div className="col-span-1">Естрадиол</div>
            <div>25.7</div>
            <div>pg/ml</div>
            <div>M 11.3 - 43.2</div>
          </div>

          <div className="grid grid-cols-4 gap-1 text-[7px] mb-0.5 opacity-50">
            <div className="col-span-1">LH</div>
            <div>6.7</div>
            <div>mIU/ml</div>
            <div>1.0 - 11.4</div>
          </div>

          <div className="grid grid-cols-4 gap-1 text-[7px] mb-1 opacity-50">
            <div className="col-span-1">FSH</div>
            <div>5.29</div>
            <div>mIU/ml</div>
            <div>1.5 - 12.4</div>
          </div>
        </div>

        {/* Result Badge */}
        <div className="bg-gradient-to-r from-purple-500 to-green-500 px-2 py-1 text-center">
          <p className="text-[10px] font-bold text-white">
            {labResults.increase} за 30 дни 🔥
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 mt-1 ml-2">
        <p className="text-xs text-gray-500">{timestamp}</p>
        <span className="text-xs text-blue-500">✓✓</span>
      </div>
    </div>
  );
};
