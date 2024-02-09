"use client";

import { BuildPlateRenderer } from "@repo/build-plate-renderer";

export default function Page(): JSX.Element {
  return (
    <main className="h-screen w-screen relative ">
      <BuildPlateRenderer className="w-full h-full bg-slate-50" />
      <div
        onPointerDown={(e) => e.stopPropagation()}
        className={
          "absolute left-4 top-4 bottom-4 z-50 w-[260px] bg-white rounded-xl overflow-y-auto no-scrollbar"
        }
      />
    </main>
  );
}
