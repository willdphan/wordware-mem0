import React from "react";

export default function Loading() {
  // You can add any UI inside Loading, including a Skeleton.
  return (
    <div className="w-full h-96 bg-[#282B2B] opacity-70 mb-4  flex items-center justify-center font-Space uppercase text-sm text-[#6A6A72]">
      <div className="animate-pulse">[generating visual]</div>
    </div>
  );
}
