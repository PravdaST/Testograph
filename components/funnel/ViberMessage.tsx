interface ViberMessageProps {
  message: string;
  timestamp: string;
  isOutgoing?: boolean; // true = our reply (right, purple), false = customer (left, gray)
  showAvatar?: boolean;
  name?: string; // Customer name (only shown for incoming messages with avatar)
  avatar?: string; // Avatar emoji or image path
}

export const ViberMessage = ({
  message,
  timestamp,
  isOutgoing = false,
  showAvatar = false,
  name,
  avatar = "👤"
}: ViberMessageProps) => {
  if (isOutgoing) {
    // Our replies - right aligned, purple bubble
    return (
      <div className="flex justify-end mb-2">
        <div className="max-w-[75%]">
          <div className="bg-[#E5E0F7] rounded-2xl rounded-tr-sm px-3 py-2">
            <p className="text-sm text-gray-800 leading-relaxed">{message}</p>
          </div>
          <div className="flex items-center gap-1 justify-end mt-1">
            <p className="text-xs text-gray-400">{timestamp}</p>
            <span className="text-xs text-[#7360F2]">✓✓</span>
          </div>
        </div>
      </div>
    );
  }

  // Customer messages - left aligned, gray bubble
  return (
    <div className="mb-2">
      {showAvatar && name && (
        <p className="text-xs text-gray-600 font-semibold mb-1 ml-10">{name}</p>
      )}
      <div className="flex items-start gap-2">
        {showAvatar && (
          <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0 flex items-center justify-center overflow-hidden">
            {avatar.startsWith('/') ? (
              <img
                src={avatar}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-lg">{avatar}</span>
            )}
          </div>
        )}
        {!showAvatar && <div className="w-8" />}
        <div className="max-w-[75%]">
          <div className="bg-white rounded-2xl rounded-tl-sm px-3 py-2 shadow-sm">
            <p className="text-sm text-gray-800 leading-relaxed">{message}</p>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <p className="text-xs text-gray-400">{timestamp}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
