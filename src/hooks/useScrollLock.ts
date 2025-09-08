import { useCallback, useRef } from 'react';

export const useScrollLock = () => {
  const scrollPosition = useRef<number>(0);
  const isLocked = useRef<boolean>(false);

  const lockScroll = useCallback(() => {
    if (isLocked.current) return;
    
    scrollPosition.current = window.pageYOffset;
    isLocked.current = true;
    
    // Prevent scrolling
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollPosition.current}px`;
    document.body.style.width = '100%';
    
    // Prevent scroll events
    window.addEventListener('scroll', preventScroll, { passive: false });
    window.addEventListener('touchmove', preventScroll, { passive: false });
  }, []);

  const unlockScroll = useCallback(() => {
    if (!isLocked.current) return;
    
    isLocked.current = false;
    
    // Restore scrolling
    document.body.style.removeProperty('overflow');
    document.body.style.removeProperty('position');
    document.body.style.removeProperty('top');
    document.body.style.removeProperty('width');
    
    // Restore scroll position
    window.scrollTo(0, scrollPosition.current);
    
    // Remove event listeners
    window.removeEventListener('scroll', preventScroll);
    window.removeEventListener('touchmove', preventScroll);
  }, []);

  const preventScroll = useCallback((e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }, []);

  return { lockScroll, unlockScroll };
};