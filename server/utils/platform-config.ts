// Dynamic platform configuration for production deployment
export function getPlatformConfig() {
  const isReplit = !!process.env.REPLIT_DOMAINS;
  const isVPS = !isReplit && !process.env.VERCEL && !process.env.RAILWAY_ENVIRONMENT;
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Enhanced domain detection for VPS
  let domain = process.env.CUSTOM_DOMAIN || 
               process.env.DOMAIN || 
               process.env.REPLIT_DOMAINS?.split(',')[0] || 
               process.env.PUBLIC_IP ||
               'localhost:5000';
  
  // Determine base URL based on platform and environment
  let baseUrl: string;
  if (isReplit) {
    baseUrl = `https://${domain}`;
  } else if (isProduction) {
    baseUrl = `https://${domain}`;
  } else {
    baseUrl = `http://${domain}`;
  }
  
  return {
    isReplit,
    isVPS,
    isProduction,
    domain,
    baseUrl,
    
    // Webhook URLs với dynamic detection
    getWebhookUrl: (path: string) => `${baseUrl}${path}`,
    
    // Voice webhook URL
    voiceWebhookUrl: `${baseUrl}/api/twilio/voice`,
    
    // Status callback URL
    statusCallbackUrl: `${baseUrl}/api/twilio/status-callback`,
    
    // Fallback URL
    fallbackUrl: `${baseUrl}/api/twilio/voice-fallback`,
    
    // AMD callback URL
    amdCallbackUrl: `${baseUrl}/api/twilio/amd-callback`
  };
}

// Export singleton instance
export const platformConfig = getPlatformConfig();