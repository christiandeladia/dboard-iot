// import React from "react";

export const LoadingSkeleton = () => (
  <div className="flex items-center justify-center h-full">
    <div className="w-full h-full animate-pulse space-y-4">
      <div className="h-full bg-gray-300 rounded"></div>
      {/* <div className="h-8 bg-gray-300 rounded"></div>
      <div className="h-8 bg-gray-300 rounded"></div> */}
    </div>
  </div>
);


export const NavbarLoadingSkeleton = () => (
    <div className="w-40 h-10 bg-gray-300 rounded animate-pulse" />
  );

// export default LoadingSkeleton;
