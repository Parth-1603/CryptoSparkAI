import { useEffect, useRef } from 'react';

/**
 * Returns a ref. When the element enters the viewport,
 * the class "revealed" is added to it.
 * Pair with .reveal / .reveal.revealed CSS classes.
 */
export function useScrollReveal(options = {}) {
  const ref = useRef(null);

  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('revealed');
          observer.unobserve(el);
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px', ...optionsRef.current }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}
