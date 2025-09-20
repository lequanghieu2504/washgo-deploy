// src/hooks/useDevice.js
import { useEffect, useState } from "react";

const isMobileWidth = () => window.innerWidth < 768;

export function useDevice() {
  const [isMobile, setIsMobile] = useState(isMobileWidth());

  useEffect(() => {
    const handleResize = () => {
      const current = isMobileWidth();
      setIsMobile((prev) => (prev !== current ? current : prev));
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile ? "mobile" : "desktop";
}
