const reportWebVitals = () => {
  if ('performance' in window && 'PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'largest-contentful-paint') {
            console.log(`[Perf] LCP: ${entry.startTime}ms`);
          }
          if (entry.entryType === 'first-input') {
            const firstInput = entry as PerformanceEventTiming;
            console.log(`[Perf] FID: ${firstInput.processingStart - firstInput.startTime}ms`);
          }
          if (entry.entryType === 'layout-shift') {
            const layoutShift = entry as PerformanceEntry & { value: number };
            console.log(`[Perf] CLS: ${layoutShift.value}`);
          }
        }
      });
      observer.observe({ type: 'largest-contentful-paint', buffered: true });
      observer.observe({ type: 'first-input', buffered: true });
      observer.observe({ type: 'layout-shift', buffered: true });
    } catch {
      // PerformanceObserver not supported
    }
  }
};

export default reportWebVitals;
