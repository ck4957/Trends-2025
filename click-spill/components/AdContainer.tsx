import React from "react";

interface AdContainerProps {
  id: string;
  minHeight?: string;
  maxWidth?: string;
  className?: string;
  showLabel?: boolean;
}

export const AdContainer: React.FC<AdContainerProps> = ({
  id,
  minHeight = "250px",
  maxWidth = "100%",
  className = "",
  showLabel = false,
}) => {
  return (
    <div>
      {showLabel && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 text-center">
          Advertisement
        </div>
      )}
      <div
        id={id}
        className="text-center flex items-center justify-center mx-auto"
        style={{
          minHeight,
          maxWidth,
        }}
      >
        {/* Ad will be injected here */}
      </div>
    </div>
  );
};
