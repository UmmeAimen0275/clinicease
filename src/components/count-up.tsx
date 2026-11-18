"use client";
import { useEffect, useState } from "react";

// Counts from 0 up to a number when the page loads
export function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const steps = 40;
    let i = 0;
    const t = setInterval(() => {
      i++;
      setN(Math.round((to * i) / steps));
      if (i >= steps) clearInterval(t);
    }, 30);
    return () => clearInterval(t);
  }, [to]);
  return <>{n.toLocaleString()}{suffix}</>;
}