import { useEffect, useRef, useState } from 'react';

/**
 * Hook to observe and return the size of an HTML element.
 * @param initialSize - Initial size of the element (default: { width: 0, height: 0 }).
 * @returns An object containing a ref to attach to the element, and its width and height.
 */
export const useComponentSize = (
  initialSize = { width: 0, height: 0 }
): { observedRef: React.RefObject<HTMLDivElement | null>; width: number; height: number } => {
  const observedRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(initialSize);

  useEffect(() => {
    if (!observedRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const cr = entry.contentRect;
        setSize({ width: cr.width, height: cr.height });
      }
    });

    resizeObserver.observe(observedRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return { observedRef, ...size };
};
