import { useState, useCallback } from "react";

export function useIsFocused() {
  const [isFocused, setIsFocused] = useState(false);
  const handleFocus = useCallback((event: React.FocusEvent<HTMLElement>) => {
    setIsFocused(true);
    queueMicrotask(() => {
      (event.target as HTMLElement).scrollIntoView({ behavior: 'smooth' });
    });
  }, []);
  const handleBlur = useCallback(() => setIsFocused(false), []);

  return { isFocused, handleFocus, handleBlur };
}
