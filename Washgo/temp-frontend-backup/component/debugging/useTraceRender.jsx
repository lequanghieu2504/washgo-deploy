import { useRef, useEffect } from "react";

export function useTraceRender(name = "Component", props) {
  const renders = useRef(0);

  console.log(`🔁 ${name} render count:`, renders.current++);
  console.log(`🔁 ${name} props:`, props);

  useEffect(() => {
    console.log(`✅ ${name} mounted`);
    return () => {
      console.log(`❌ ${name} unmounted`);
    };
  }, []);
}
