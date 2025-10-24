// Performance monitoring
class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
  }

  startMeasure(name) {
    if (window.performance && window.performance.now) {
      this.metrics.set(name, window.performance.now());
    }
  }

  endMeasure(name) {
    if (window.performance && window.performance.now) {
      const startTime = this.metrics.get(name);
      if (startTime) {
        const duration = window.performance.now() - startTime;
        this.metrics.delete(name);
        
        // Log to analytics
        if (window.gtag) {
          window.gtag('event', 'performance_measure', {
            metric_name: name,
            duration_ms: Math.round(duration),
            timestamp: new Date().toISOString()
          });
        }
        
        // Log to console in development
        if (process.env.NODE_ENV === 'development') {
          console.debug(`Performance [${name}]: ${Math.round(duration)}ms`);
        }

        return duration;
      }
    }
    return null;
  }

  // Mark important events for the performance timeline
  markEvent(name) {
    if (window.performance && window.performance.mark) {
      window.performance.mark(name);
    }
  }

  // Create a measure between two marks
  measure(name, startMark, endMark) {
    if (window.performance && window.performance.measure) {
      try {
        window.performance.measure(name, startMark, endMark);
        const entry = window.performance.getEntriesByName(name).pop();
        
        if (entry && window.gtag) {
          window.gtag('event', 'performance_measure', {
            metric_name: name,
            duration_ms: Math.round(entry.duration),
            timestamp: new Date().toISOString()
          });
        }
        
        return entry?.duration || null;
      } catch (error) {
        console.error('Performance measurement error:', error);
        return null;
      }
    }
    return null;
  }

  // Monitor network requests
  monitorFetch() {
    if (!window._originalFetch) {
      window._originalFetch = window.fetch;
      
      window.fetch = async (...args) => {
        const startTime = window.performance.now();
        const url = typeof args[0] === 'string' ? args[0] : args[0].url;
        
        try {
          const response = await window._originalFetch(...args);
          const duration = window.performance.now() - startTime;
          
          // Log network timing
          if (window.gtag) {
            window.gtag('event', 'network_request', {
              url: url,
              duration_ms: Math.round(duration),
              status: response.status,
              timestamp: new Date().toISOString()
            });
          }
          
          return response;
        } catch (error) {
          const duration = window.performance.now() - startTime;
          
          // Log failed requests
          if (window.gtag) {
            window.gtag('event', 'network_error', {
              url: url,
              duration_ms: Math.round(duration),
              error: error.message,
              timestamp: new Date().toISOString()
            });
          }
          
          throw error;
        }
      };
    }
  }

  // Monitor component render times
  withPerformanceTracking(WrappedComponent, componentName) {
    return class PerformanceTrackedComponent extends React.Component {
      componentDidMount() {
        this.endMeasure();
      }

      componentDidUpdate() {
        this.endMeasure();
      }

      endMeasure() {
        const duration = performanceMonitor.endMeasure(`render_${componentName}`);
        if (duration && window.gtag) {
          window.gtag('event', 'component_render', {
            component_name: componentName,
            duration_ms: Math.round(duration),
            timestamp: new Date().toISOString()
          });
        }
      }

      render() {
        performanceMonitor.startMeasure(`render_${componentName}`);
        return <WrappedComponent {...this.props} />;
      }
    };
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Initialize monitoring
performanceMonitor.monitorFetch();

// Export HOC for component tracking
export const withPerformanceTracking = performanceMonitor.withPerformanceTracking;