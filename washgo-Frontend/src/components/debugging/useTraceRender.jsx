import { useRef, useEffect } from "react";

export function useTraceRender(name = "Component", props) {
  const renders = useRef(0);
  const prevProps = useRef(props);

  useEffect(() => {
    prevProps.current = props;
  });

  const renderCount = renders.current++;

  const changedProps = Object.entries(props).reduce((acc, [key, value]) => {
    if (prevProps.current[key] !== value) {
      acc[key] = {
        from: prevProps.current[key],
        to: value,
      };
    }
    return acc;
  }, {});

  console.groupCollapsed(`🔁 ${name} Render #${renderCount}`);
  console.log("Props:", props);
  if (Object.keys(changedProps).length > 0) {
    console.log("Changed Props:", changedProps);
  } else if (renderCount > 0) {
    console.log("No props changed since last render.");
  }
  console.groupEnd();

  useEffect(() => {
    console.log(`✅ ${name} mounted`);
    return () => {
      console.log(`❌ ${name} unmounted`);
    };
  }, []);
}
