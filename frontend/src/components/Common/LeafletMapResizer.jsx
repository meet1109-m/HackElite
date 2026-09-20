import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

/**
 * LeafletMapResizer component to resolve Issue 3.1:
 * Leaflet Container Invalidation & Grey/Blank Tiles.
 *
 * When switching tabs, mounting inside flexbox/grid containers, or resizing the window,
 * Leaflet may initialize before the container dimensions are finalized.
 * This hook calls map.invalidateSize() across multiple frames and via ResizeObserver
 * to ensure 100% tile coverage without grey rectangles or blank canvases.
 */
export default function LeafletMapResizer() {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    // 1. Immediate invalidation
    map.invalidateSize();

    // 2. Scheduled invalidations after flex layout reflow and CSS animations
    const timer1 = setTimeout(() => {
      map.invalidateSize();
    }, 100);

    const timer2 = setTimeout(() => {
      map.invalidateSize();
    }, 350);

    const timer3 = setTimeout(() => {
      map.invalidateSize();
    }, 800);

    // 3. ResizeObserver on the map's HTML container
    const container = map.getContainer();
    let resizeObserver = null;

    if (typeof ResizeObserver !== 'undefined' && container) {
      resizeObserver = new ResizeObserver(() => {
        map.invalidateSize();
      });
      resizeObserver.observe(container);
    }

    // 4. Window resize listener fallback
    const handleResize = () => {
      map.invalidateSize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      window.removeEventListener('resize', handleResize);
      if (resizeObserver && container) {
        resizeObserver.unobserve(container);
        resizeObserver.disconnect();
      }
    };
  }, [map]);

  return null;
}
