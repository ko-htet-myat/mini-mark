// import * as React from "react"

// const MOBILE_BREAKPOINT = 768

// export function useIsMobile() {
//   const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

//   React.useEffect(() => {
//     const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
//     const onChange = () => {
//       setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
//     }
//     mql.addEventListener("change", onChange)
//     setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
//     return () => mql.removeEventListener("change", onChange)
//   }, [])

//   return !!isMobile
// }

import * as React from "react";

const MOBILE_BREAKPOINT = 768;

// Helper to create the media query list
const getMql = () => {
  if (typeof window === "undefined") return null;
  return window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
};

export function useIsMobile() {
  const subscribe = React.useCallback((callback: () => void) => {
    const mql = getMql();
    if (!mql) return () => {};

    mql.addEventListener("change", callback);
    return () => mql.removeEventListener("change", callback);
  }, []);

  const getSnapshot = React.useCallback(() => {
    const mql = getMql();
    return mql ? mql.matches : false;
  }, []);

  const getServerSnapshot = React.useCallback(() => {
    return false; // Default fallback for SSR (Server-Side Rendering)
  }, []);

  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
