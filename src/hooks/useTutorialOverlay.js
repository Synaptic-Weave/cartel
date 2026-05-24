import { useState, useLayoutEffect } from 'react';

/**
 * Custom React hook to calculate target-adjacent positions dynamically.
 * Measures the target element via getBoundingClientRect() and returns top/left coords
 * with auto-flipping and screen edge clamping to prevent clipping.
 * 
 * @param {string} targetSelector - CSS selector of the focused element
 * @param {string} placement - Preferred placement: 'top' | 'bottom' | 'left' | 'right'
 * @param {boolean} active - Whether calculations should run (to avoid running when inactive)
 * @returns {object} { top: number, left: number, arrowClass: string }
 */
export function useTutorialOverlay(targetSelector, placement = 'bottom', active = false) {
  const [coords, setCoordinates] = useState({ top: 0, left: 0, arrowClass: '' });

  useLayoutEffect(() => {
    if (!active || !targetSelector) return;

    function calculatePosition() {
      const element = document.querySelector(targetSelector);
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const cardWidth = 350;
      const cardHeight = 240; // Approximated card height threshold
      const spacing = 16;
      const viewportMargin = 16;
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      let computedTop = 0;
      let computedLeft = 0;
      let actualPlacement = placement;

      // 1. Auto-flipping logic to prevent vertical clipping
      if (placement === 'top' && rect.top - cardHeight - spacing < viewportMargin) {
        actualPlacement = 'bottom';
      } else if (placement === 'bottom' && rect.bottom + cardHeight + spacing > vh - viewportMargin) {
        actualPlacement = 'top';
      }

      // 2. Compute raw coordinates based on final placement
      switch (actualPlacement) {
        case 'top':
          computedTop = rect.top - cardHeight - spacing;
          computedLeft = rect.left + (rect.width / 2) - (cardWidth / 2);
          break;
        case 'bottom':
          computedTop = rect.bottom + spacing;
          computedLeft = rect.left + (rect.width / 2) - (cardWidth / 2);
          break;
        case 'left':
          computedTop = rect.top + (rect.height / 2) - (cardHeight / 2);
          computedLeft = rect.left - cardWidth - spacing;
          break;
        case 'right':
          computedTop = rect.top + (rect.height / 2) - (cardHeight / 2);
          computedLeft = rect.right + spacing;
          break;
        default:
          computedTop = rect.bottom + spacing;
          computedLeft = rect.left + (rect.width / 2) - (cardWidth / 2);
          break;
      }

      // 3. Viewport Boundary Clamp Guards
      computedLeft = Math.max(viewportMargin, Math.min(computedLeft, vw - cardWidth - viewportMargin));
      computedTop = Math.max(viewportMargin, Math.min(computedTop, vh - cardHeight - viewportMargin));

      // 4. Map placement to arrow indicator classes
      const arrowMap = {
        top: 'tutorial-arrow-bottom',
        bottom: 'tutorial-arrow-top',
        left: 'tutorial-arrow-right',
        right: 'tutorial-arrow-left'
      };

      setCoordinates({
        top: computedTop,
        left: computedLeft,
        arrowClass: arrowMap[actualPlacement] || ''
      });
    }

    calculatePosition();

    // Resize observer or resize window listener to recalculate position
    window.addEventListener('resize', calculatePosition);
    
    // Polling interval to handle dynamic tab transitions or DOM rendering delays
    const interval = setInterval(calculatePosition, 200);

    return () => {
      window.removeEventListener('resize', calculatePosition);
      clearInterval(interval);
    };
  }, [targetSelector, placement, active]);

  return coords;
}
