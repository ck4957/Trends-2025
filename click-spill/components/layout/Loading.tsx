import React from "react";

const Loading: React.FC = () => {
  return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-pulse text-blue-500">
        Loading trending topics...
      </div>
    </div>
  );
};

export default Loading;
