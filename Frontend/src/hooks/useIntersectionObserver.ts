import { useEffect, useRef, useState } from "react";

// Custom hook for intersection observer with one-shot completion to preserve performance
export interface UseIntersectionObserverOptions extends IntersectionObserverInit {
  freezeOnceVisible?: boolean;
}

const useIntersectionObserver = (options: UseIntersectionObserverOptions = {}) => {
  const { threshold = 0.1, rootMargin = "0px 0px -50px 0px", root = null, freezeOnceVisible = true } = options;
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || (freezeOnceVisible && hasIntersected)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isElementIntersecting = entry.isIntersecting;
        setIsIntersecting(isElementIntersecting);
        if (isElementIntersecting && !hasIntersected) {
          setHasIntersected(true);
          if (freezeOnceVisible) {
            observer.unobserve(element);
          }
        }
      },
      {
        threshold,
        rootMargin,
        root,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [hasIntersected, threshold, rootMargin, root, freezeOnceVisible]);

  return { ref, isIntersecting, hasIntersected };
};

export default useIntersectionObserver;