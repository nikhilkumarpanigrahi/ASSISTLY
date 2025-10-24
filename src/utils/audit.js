import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

class AuditLogger {
  constructor() {
    this.enabled = process.env.REACT_APP_ENABLE_AUDIT_LOGGING === 'true';
    this.logsCollection = 'audit_logs';
  }

  async log(event, details = {}, userId = null) {
    if (!this.enabled) return;

    try {
      const logEntry = {
        event,
        details,
        userId,
        userAgent: navigator.userAgent,
        timestamp: serverTimestamp(),
        environment: process.env.NODE_ENV
      };

      await addDoc(collection(db, this.logsCollection), logEntry);
      
      // Also send to analytics if configured
      if (window.gtag) {
        window.gtag('event', 'audit_log', {
          event_name: event,
          user_id: userId,
          ...details,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Audit logging error:', error);
      
      // Don't throw - logging should never break the application
      if (process.env.NODE_ENV === 'development') {
        console.warn('Audit log failed:', { event, details, userId });
      }
    }
  }

  // Predefined audit events
  async logAuth(action, userId, success, details = {}) {
    await this.log(`auth_${action}`, {
      success,
      ...details
    }, userId);
  }

  async logRequest(action, requestId, userId, details = {}) {
    await this.log(`request_${action}`, {
      requestId,
      ...details
    }, userId);
  }

  async logError(error, context = {}, userId = null) {
    await this.log('error', {
      error: error.message,
      stack: error.stack,
      ...context
    }, userId);
  }

  async logNavigation(from, to, userId = null) {
    await this.log('navigation', {
      from,
      to,
      referrer: document.referrer
    }, userId);
  }

  async logFeatureUsage(feature, action, details = {}, userId = null) {
    await this.log('feature_usage', {
      feature,
      action,
      ...details
    }, userId);
  }

  async logPerformance(metric, value, context = {}, userId = null) {
    await this.log('performance', {
      metric,
      value,
      ...context
    }, userId);
  }
}

export const auditLogger = new AuditLogger();

// React component hook for automatic navigation logging
export const useNavigationLogger = (userId = null) => {
  React.useEffect(() => {
    const logPageView = () => {
      auditLogger.logNavigation(
        document.referrer,
        window.location.href,
        userId
      );
    };

    logPageView();

    window.addEventListener('popstate', logPageView);
    return () => window.removeEventListener('popstate', logPageView);
  }, [userId]);
};