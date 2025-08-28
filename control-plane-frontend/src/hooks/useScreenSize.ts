import { useEffect, useState } from "react";

const useScreenSize = () => {
  const getWindowDimensions = () => ({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const getScreenSizeFlags = (width: number) => ({
    isSmall: width < 768,
    isMedium: width >= 768 && width < 1024,
    isLarge: width >= 1024 && width < 1280,
    isXLarge: width >= 1280,
  });

  const [dimensions, setDimensions] = useState(() => {
    if (typeof window !== "undefined") return getWindowDimensions();

    return { width: 0, height: 0 };
  });

  const [screenSizeFlags, setScreenSizeFlags] = useState(() => {
    if (typeof window !== "undefined")
      return getScreenSizeFlags(window.innerWidth);

    return { isSmall: false, isMedium: false, isLarge: false, isXLarge: false };
  });

  useEffect(() => {
    const handleResize = () => {
      const { width, height } = getWindowDimensions();

      setDimensions({ width, height });
      setScreenSizeFlags(getScreenSizeFlags(width));
    };

    if (typeof window !== "undefined") {
      handleResize();

      window.addEventListener("resize", handleResize);

      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  return { ...dimensions, ...screenSizeFlags };
};

export default useScreenSize;
