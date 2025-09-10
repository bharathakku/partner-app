// Notification service for order receiving with sound and vibration alerts
export class NotificationService {
  constructor() {
    this.audioContext = null;
    this.alertSound = null;
    this.isVibrationSupported = typeof navigator !== 'undefined' && 'vibrate' in navigator;
    this.isAudioSupported = typeof window !== 'undefined' && ('AudioContext' in window || 'webkitAudioContext' in window);
    this.notificationPermission = null;
    this.isBrowser = typeof window !== 'undefined';
    
    if (this.isBrowser) {
      this.initializeAudio();
      this.requestPermissions();
    }
  }

  // Initialize Web Audio API for custom ring tones
  async initializeAudio() {
    if (!this.isAudioSupported || !this.isBrowser) return;

    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (error) {
      console.warn('Audio context not available:', error);
      this.isAudioSupported = false;
    }
  }

  // Request notification and other permissions
  async requestPermissions() {
    if (!this.isBrowser) return;
    
    // Request notification permission
    if ('Notification' in window) {
      try {
        this.notificationPermission = await Notification.requestPermission();
      } catch (error) {
        console.warn('Notification permission request failed:', error);
      }
    }

    // For audio context, may need user interaction first
    if (this.audioContext && this.audioContext.state === 'suspended') {
      // Will be resumed on first user interaction
      document.addEventListener('click', () => {
        if (this.audioContext && this.audioContext.state === 'suspended') {
          this.audioContext.resume();
        }
      }, { once: true });
    }
  }

  // Create custom ring tone using Web Audio API
  createRingTone(frequency = 800, duration = 1000, type = 'sine') {
    if (!this.audioContext) return null;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

    // Create envelope for smooth fade in/out
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.1);
    gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + duration / 1000 - 0.1);
    gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + duration / 1000);

    return { oscillator, gainNode };
  }

  // Play order notification sound
  async playOrderAlert() {
    if (!this.audioContext || !this.isBrowser) return;

    try {
      // Standard notification tone for all orders
      const config = { frequency: 800, duration: 1000, pattern: [600, 800] };
      
      // Play pattern of tones
      for (let i = 0; i < config.pattern.length; i++) {
        const tone = this.createRingTone(config.pattern[i], 300);
        if (tone) {
          tone.oscillator.start(this.audioContext.currentTime + i * 0.4);
          tone.oscillator.stop(this.audioContext.currentTime + (i * 0.4) + 0.3);
        }
      }
    } catch (error) {
      console.warn('Error playing audio alert:', error);
      // Fallback to system beep
      this.playSystemBeep();
    }
  }

  // Fallback system beep
  playSystemBeep() {
    if (!this.isBrowser) return;
    
    try {
      // Create a simple beep using data URL
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+TZnF8eBDN+zPLNhzEJHm7A7+OZORQRSL3n77tpGgU+jdrzuXkjBSl+zfPCeiU=');
      audio.play().catch(() => {
        // Silent fail for audio
      });
    } catch (error) {
      console.warn('System beep failed:', error);
    }
  }

  // Trigger device vibration
  triggerVibration(pattern = [200, 100, 200]) {
    if (!this.isVibrationSupported || !this.isBrowser) return;

    try {
      navigator.vibrate(pattern);
    } catch (error) {
      console.warn('Vibration failed:', error);
    }
  }

  // Show browser notification
  showNotification(title, options = {}) {
    if (!this.isBrowser || this.notificationPermission !== 'granted') return;

    try {
      const notification = new Notification(title, {
        icon: '/icon-192x192.png', // Add your app icon
        badge: '/badge-72x72.png', // Add badge icon
        tag: 'order-notification',
        requireInteraction: true,
        ...options
      });

      // Auto close after 10 seconds if not interacted
      setTimeout(() => {
        notification.close();
      }, 10000);

      return notification;
    } catch (error) {
      console.warn('Notification failed:', error);
      return null;
    }
  }

  // Complete order alert with sound, vibration and notification
  async triggerOrderAlert(order) {
    // Play standard sound
    await this.playOrderAlert();
    
    // Trigger standard vibration pattern
    this.triggerVibration([200, 100, 200]);
    
    // Show notification
    const notification = this.showNotification(`New Order: ${order.id}`, {
      body: `${order.customerName} • ₹${order.partnerEarnings} earnings • ${order.distance}`,
      icon: this.getOrderTypeIcon(order.parcelDetails.type),
      data: order
    });

    return notification;
  }

  // Get appropriate icon based on order type
  getOrderTypeIcon(type) {
    const iconMap = {
      'Electronics': '/icons/electronics.png',
      'Food & Groceries': '/icons/food.png',
      'Clothing': '/icons/clothing.png',
      'Medicine & Healthcare': '/icons/medicine.png',
      'Books & Stationery': '/icons/books.png'
    };
    
    return iconMap[type] || '/icons/package.png';
  }

  // Reset audio context if needed
  resetAudioContext() {
    if (!this.isBrowser) return;
    
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  // Cleanup resources
  cleanup() {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

// Create singleton instance
export const notificationService = new NotificationService();

// Hook for React components
export const useNotification = () => {
  return {
    playOrderAlert: () => notificationService.playOrderAlert(),
    triggerVibration: (pattern) => notificationService.triggerVibration(pattern),
    showNotification: (title, options) => notificationService.showNotification(title, options),
    triggerOrderAlert: (order) => notificationService.triggerOrderAlert(order),
    resetAudioContext: () => notificationService.resetAudioContext()
  };
};
