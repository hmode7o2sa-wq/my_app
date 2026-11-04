/**
 * Browser notification & audio chime utility for tasks and study sessions
 */

export const isNotificationSupported = (): boolean => {
  return typeof window !== 'undefined' && 'Notification' in window;
};

export const getNotificationPermission = (): NotificationPermission => {
  if (!isNotificationSupported()) return 'denied';
  return Notification.permission;
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!isNotificationSupported()) return false;
  try {
    const perm = await Notification.requestPermission();
    if (perm === 'granted') {
      sendBrowserNotification('تم تفعيل التنبيهات بنجاح 🔔', {
        body: 'سنقوم بتنبيهك عند اقتراب انتهاء المؤقت، ومواعيد الواجبات والاختبارات!',
        icon: '/favicon.ico',
      });
      playChimeSound('success');
      return true;
    }
  } catch (err) {
    console.warn('Could not request notification permission:', err);
  }
  return false;
};

export const sendBrowserNotification = (
  title: string,
  options?: {
    body?: string;
    icon?: string;
    tag?: string;
    requireInteraction?: boolean;
  }
) => {
  if (!isNotificationSupported()) return;

  if (Notification.permission === 'granted') {
    try {
      new Notification(title, {
        icon: '/favicon.ico',
        ...options,
      });
    } catch (e) {
      console.warn('Notification send failed:', e);
    }
  }
};

/**
 * Web Audio API gentle synthesizer chime
 */
export const playChimeSound = (type: 'warning' | 'finish' | 'success' = 'finish') => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (type === 'warning') {
      // 2 short beeps
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'finish' || type === 'success') {
      // Ascending pleasant arpeggio
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12);
        gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.12);
        osc.stop(ctx.currentTime + i * 0.12 + 0.45);
      });
    }
  } catch (err) {
    // Ignore audio autoplay restrictions
  }
};
