/**
 * AUTO AUTH CLEANUP
 * Tự động dọn dẹp và xử lý authentication state
 */

export class AutoAuthCleanup {
  private static instance: AutoAuthCleanup;

  static getInstance(): AutoAuthCleanup {
    if (!AutoAuthCleanup.instance) {
      AutoAuthCleanup.instance = new AutoAuthCleanup();
    }
    return AutoAuthCleanup.instance;
  }

  /**
   * Kiểm tra và dọn dẹp auth state
   */
  async cleanupAuthState(): Promise<void> {
    try {
      console.log('🧹 Auto-cleanup: Checking auth state...');
      
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!accessToken && !refreshToken) {
        console.log('✅ No tokens found, state is clean');
        return;
      }

      // Kiểm tra token validity
      if (accessToken) {
        const isValid = await this.validateToken(accessToken);
        if (!isValid) {
          console.log('🧹 Invalid access token detected, clearing...');
          this.clearAllAuthData();
          return;
        }
      }

      console.log('✅ Auth state is valid');
    } catch (error) {
      console.log('🧹 Error during auth cleanup, clearing all data...');
      this.clearAllAuthData();
    }
  }

  /**
   * Validate token với server
   */
  private async validateToken(token: string): Promise<boolean> {
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Clear toàn bộ auth data
   */
  clearAllAuthData(): void {
    console.log('🧹 Clearing all authentication data...');
    
    // Clear localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    
    // Clear sessionStorage nếu có
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    
    // Clear any cached user data
    localStorage.removeItem('userData');
    localStorage.removeItem('userPreferences');
    
    console.log('✅ All auth data cleared');
  }

  /**
   * Force logout và redirect
   */
  forceLogout(): void {
    console.log('🚪 Force logout triggered...');
    
    this.clearAllAuthData();
    
    // Force redirect to landing page
    window.location.href = '/';
  }

  /**
   * Khởi tạo auto-cleanup khi load page
   */
  initializeAutoCleanup(): void {
    console.log('🚀 Initializing auto auth cleanup...');
    
    // Cleanup ngay khi load
    this.cleanupAuthState();
    
    // Listen for storage changes từ other tabs
    window.addEventListener('storage', (event) => {
      if (event.key === 'accessToken' || event.key === 'refreshToken') {
        console.log('🔄 Auth storage changed, re-validating...');
        this.cleanupAuthState();
      }
    });
    
    // Cleanup định kỳ mỗi 5 phút
    setInterval(() => {
      this.cleanupAuthState();
    }, 5 * 60 * 1000);
    
    console.log('✅ Auto auth cleanup initialized');
  }

  /**
   * Handle JWT secret changes
   */
  handleJWTSecretChange(): void {
    console.log('🔧 JWT secret change detected, forcing auth cleanup...');
    
    // Khi JWT secret thay đổi, tất cả tokens sẽ invalid
    this.clearAllAuthData();
    
    // Show notification nếu cần
    try {
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('Hệ thống đã được cập nhật', {
          body: 'Vui lòng đăng nhập lại để tiếp tục',
          icon: '/favicon.ico'
        });
      }
    } catch (error) {
      console.log('Notification not available');
    }
  }

  /**
   * Detect và handle system updates
   */
  detectSystemUpdates(): void {
    // Kiểm tra nếu có system version change (safe for browser)
    try {
      const lastVersion = localStorage.getItem('systemVersion');
      const currentVersion = '1.0.0'; // Static version for now
      
      if (lastVersion && lastVersion !== currentVersion) {
        console.log('🔄 System update detected, cleaning up...');
        this.clearAllAuthData();
        localStorage.setItem('systemVersion', currentVersion);
      } else if (!lastVersion) {
        localStorage.setItem('systemVersion', currentVersion);
      }
    } catch (error) {
      console.log('Version check skipped');
    }
  }
}

// Export singleton instance
export const autoAuthCleanup = AutoAuthCleanup.getInstance();