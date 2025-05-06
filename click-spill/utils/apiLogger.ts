/**
 * Debug logger utility for API routes and database queries
 * Only logs when API_DEBUG_LOGGING is enabled
 */

type LogLevel = "info" | "warn" | "error" | "debug";

export const apiLogger = {
  info: (message: string, data?: any) => {
    if (process.env.API_DEBUG_LOGGING === "true") {
      console.log(`ℹ️ INFO: ${message}`, data ? data : "");
    }
  },

  warn: (message: string, data?: any) => {
    if (process.env.API_DEBUG_LOGGING === "true") {
      console.warn(`⚠️ WARN: ${message}`, data ? data : "");
    }
  },

  error: (message: string, data?: any) => {
    // Always log errors regardless of debug setting
    console.error(`❌ ERROR: ${message}`, data ? data : "");
  },

  debug: (message: string, data?: any) => {
    if (process.env.API_DEBUG_LOGGING === "true") {
      console.log(`🔍 DEBUG: ${message}`, data ? data : "");
    }
  },

  // For logging Supabase queries
  query: (method: string, table: string, filters?: any) => {
    if (process.env.API_DEBUG_LOGGING === "true") {
      console.log(`🔍 QUERY: ${method} on ${table}`, filters ? filters : "");
    }
  },

  // Start/end of request timing
  time: (label: string) => {
    if (process.env.API_DEBUG_LOGGING === "true") {
      console.time(`⏱️ ${label}`);
    }
  },

  timeEnd: (label: string) => {
    if (process.env.API_DEBUG_LOGGING === "true") {
      console.timeEnd(`⏱️ ${label}`);
    }
  },
};
