/**
 * 🌐 DYNAMIC DOMAIN DETECTOR
 * Tự động detect domain khi runtime cho deployment
 * Hỗ trợ preview, deploy, và custom domain
 */

export class DomainDetector {
  private static cachedDomain: string | null = null;
  
  /**
   * Auto-detect domain từ environment hoặc request
   */
  static detectDomain(req?: any): string {
    // Cache domain để tránh multiple detection
    if (this.cachedDomain) {
      return this.cachedDomain;
    }

    let domain = "";

    // Priority 1: Custom domain từ environment
    if (process.env.CUSTOM_DOMAIN) {
      domain = process.env.CUSTOM_DOMAIN;
    }
    // Priority 2: Replit domains
    else if (process.env.REPLIT_DOMAINS) {
      domain = process.env.REPLIT_DOMAINS;
    }
    // Priority 3: Replit deployment format
    else if (process.env.REPL_SLUG && process.env.REPL_OWNER) {
      domain = `${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.replit.app`;
    }
    // Priority 4: Replit ID fallback
    else if (process.env.REPL_ID) {
      domain = `${process.env.REPL_ID}.replit.app`;
    }
    // Priority 5: Request header (runtime detection)
    else if (req?.get?.('host')) {
      domain = req.get('host');
    }
    // Priority 6: Other platforms
    else if (process.env.VERCEL_URL) {
      domain = process.env.VERCEL_URL;
    }
    else if (process.env.RAILWAY_PUBLIC_DOMAIN) {
      domain = process.env.RAILWAY_PUBLIC_DOMAIN;
    }
    else if (process.env.RENDER_EXTERNAL_URL) {
      domain = process.env.RENDER_EXTERNAL_URL.replace('https://', '');
    }
    // Fallback
    else {
      domain = "localhost:5000";
    }

    // Cache domain
    this.cachedDomain = domain;
    
    console.log(`🌐 Domain detected: ${domain}`);
    return domain;
  }

  /**
   * Get webhook URLs với detected domain
   */
  static getWebhookUrls(req?: any): {
    voice: string;
    status: string;
    fallback: string;
    sms: string;
  } {
    const domain = this.detectDomain(req);
    const baseUrl = `https://${domain}`;

    return {
      voice: `${baseUrl}/api/twilio/voice`,
      status: `${baseUrl}/api/twilio/status-callback`,
      fallback: `${baseUrl}/api/twilio/voice-fallback`,
      sms: `${baseUrl}/api/twilio/sms`
    };
  }

  /**
   * Update cached domain (dùng khi domain change)
   */
  static updateDomain(newDomain: string): void {
    this.cachedDomain = newDomain;
    console.log(`🔄 Domain updated to: ${newDomain}`);
  }

  /**
   * Clear cache (force re-detection)
   */
  static clearCache(): void {
    this.cachedDomain = null;
  }
}