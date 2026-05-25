"use client";

import { type ReactNode } from "react";

interface PhoneFrameProps {
  children: ReactNode;
}

export function PhoneFrame({ children }: PhoneFrameProps) {
  return (
    <div className="relative shrink-0" style={{ width: "393px" }}>
      {/* 左サイドボタン（装飾） */}
      <div className="absolute left-[-4px] top-[160px] w-[4px] h-[36px] bg-gray-700 rounded-l-sm z-10" />
      <div className="absolute left-[-4px] top-[210px] w-[4px] h-[64px] bg-gray-700 rounded-l-sm z-10" />
      <div className="absolute left-[-4px] top-[290px] w-[4px] h-[64px] bg-gray-700 rounded-l-sm z-10" />
      {/* 右サイドボタン（装飾） */}
      <div className="absolute right-[-4px] top-[220px] w-[4px] h-[96px] bg-gray-700 rounded-r-sm z-10" />

      {/* 本体フレーム */}
      <div
        className="relative overflow-hidden shadow-2xl"
        style={{
          background: "linear-gradient(145deg, #2a2a2a, #1a1a1a)",
          borderRadius: "48px",
          padding: "12px",
          border: "1px solid #3a3a3a",
        }}
      >
        {/* ダイナミックアイランド */}
        <div
          className="absolute z-20 bg-black"
          style={{
            top: "22px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "124px",
            height: "36px",
            borderRadius: "20px",
          }}
        />

        {/* スクリーン */}
        <div
          className="relative bg-white overflow-hidden"
          style={{
            borderRadius: "38px",
            height: "720px",
            overflow: "hidden",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
