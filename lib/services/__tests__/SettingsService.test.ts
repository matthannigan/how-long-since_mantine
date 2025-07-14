// SettingsService unit tests
import { db } from '@/lib/db';
import type { AppSettings, UserPreferences } from '@/types';
import { SettingsService } from '../SettingsService';

// Mock the database
jest.mock('@/lib/db', () => ({
  db: {
    settings: {
      get: jest.fn(),
      put: jest.fn(),
      add: jest.fn(),
    },
  },
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

describe('SettingsService', () => {
  let settingsService: SettingsService;
  let mockSettings: AppSettings;

  beforeEach(() => {
    settingsService = new SettingsService();

    mockSettings = {
      id: 'default',
      lastBackupDate: null,
      currentView: 'category',
      theme: 'system',
      textSize: 'default',
      highContrast: false,
      reducedMotion: false,
      onboardingCompleted: false,
    };

    // Reset all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getSettings', () => {
    it('should return existing settings', async () => {
      (db.settings.get as jest.Mock).mockResolvedValue(mockSettings);

      const result = await settingsService.getSettings();

      expect(db.settings.get).toHaveBeenCalledWith('default');
      expect(result).toEqual(mockSettings);
    });

    it('should create default settings when none exist', async () => {
      (db.settings.get as jest.Mock).mockResolvedValue(null);
      (db.settings.add as jest.Mock).mockResolvedValue('default');

      const result = await settingsService.getSettings();

      expect(db.settings.add).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'default',
          currentView: 'category',
          theme: 'system',
          textSize: 'default',
          highContrast: false,
          reducedMotion: false,
          onboardingCompleted: false,
        })
      );
      expect(result.id).toBe('default');
    });

    it('should throw error when database operation fails', async () => {
      (db.settings.get as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(settingsService.getSettings()).rejects.toThrow(
        'Failed to fetch settings: Error: Database error'
      );
    });
  });

  describe('updateSettings', () => {
    it('should update settings successfully', async () => {
      const updates = { theme: 'dark' as const };
      const updatedSettings = { ...mockSettings, ...updates };

      (db.settings.get as jest.Mock).mockResolvedValue(mockSettings);
      (db.settings.put as jest.Mock).mockResolvedValue('default');

      const result = await settingsService.updateSettings(updates);

      expect(db.settings.put).toHaveBeenCalledWith(updatedSettings);
      expect(result.theme).toBe('dark');
    });

    it('should preserve settings ID when updating', async () => {
      const updates = { id: 'different-id', theme: 'dark' as const };

      (db.settings.get as jest.Mock).mockResolvedValue(mockSettings);
      (db.settings.put as jest.Mock).mockResolvedValue('default');

      const result = await settingsService.updateSettings(updates);

      expect(result.id).toBe('default'); // Should preserve original ID
    });

    it('should throw error with invalid settings data', async () => {
      (db.settings.get as jest.Mock).mockResolvedValue(mockSettings);
      const invalidUpdates = { theme: 'invalid-theme' as any };

      await expect(settingsService.updateSettings(invalidUpdates)).rejects.toThrow(
        'Settings validation failed'
      );
    });

    it('should throw error when database operation fails', async () => {
      (db.settings.get as jest.Mock).mockResolvedValue(mockSettings);
      (db.settings.put as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(settingsService.updateSettings({ theme: 'dark' })).rejects.toThrow(
        'Failed to update settings'
      );
    });
  });

  describe('getUserPreferences', () => {
    it('should return user preferences subset', async () => {
      const settingsWithBackup = { ...mockSettings, lastBackupDate: new Date() };
      (db.settings.get as jest.Mock).mockResolvedValue(settingsWithBackup);

      const result = await settingsService.getUserPreferences();

      expect(result).toEqual({
        theme: 'system',
        textSize: 'default',
        highContrast: false,
        reducedMotion: false,
        backupReminders: true, // lastBackupDate is not null
      });
    });

    it('should indicate no backup reminders when never backed up', async () => {
      (db.settings.get as jest.Mock).mockResolvedValue(mockSettings);

      const result = await settingsService.getUserPreferences();

      expect(result.backupReminders).toBe(false);
    });
  });

  describe('updateUserPreferences', () => {
    it('should update user preferences successfully', async () => {
      const preferences: Partial<UserPreferences> = {
        theme: 'dark',
        textSize: 'large',
        highContrast: true,
      };

      (db.settings.get as jest.Mock).mockResolvedValue(mockSettings);
      (db.settings.put as jest.Mock).mockResolvedValue('default');

      // Mock the updated settings after getUserPreferences call
      const updatedSettings = {
        ...mockSettings,
        theme: 'dark' as const,
        textSize: 'large' as const,
        highContrast: true,
      };
      (db.settings.get as jest.Mock)
        .mockResolvedValueOnce(mockSettings)
        .mockResolvedValueOnce(updatedSettings);

      const result = await settingsService.updateUserPreferences(preferences);

      expect(db.settings.put).toHaveBeenCalledWith(
        expect.objectContaining({
          theme: 'dark',
          textSize: 'large',
          highContrast: true,
        })
      );
      expect(result.theme).toBe('dark');
      expect(result.textSize).toBe('large');
      expect(result.highContrast).toBe(true);
    });
  });

  describe('setCurrentView', () => {
    it('should set current view successfully', async () => {
      (db.settings.get as jest.Mock).mockResolvedValue(mockSettings);
      (db.settings.put as jest.Mock).mockResolvedValue('default');

      await settingsService.setCurrentView('time');

      expect(db.settings.put).toHaveBeenCalledWith(
        expect.objectContaining({
          currentView: 'time',
        })
      );
    });
  });

  describe('getCurrentView', () => {
    it('should return current view', async () => {
      const settingsWithTimeView = { ...mockSettings, currentView: 'time' as const };
      (db.settings.get as jest.Mock).mockResolvedValue(settingsWithTimeView);

      const result = await settingsService.getCurrentView();

      expect(result).toBe('time');
    });
  });

  describe('completeOnboarding', () => {
    it('should mark onboarding as completed', async () => {
      (db.settings.get as jest.Mock).mockResolvedValue(mockSettings);
      (db.settings.put as jest.Mock).mockResolvedValue('default');

      await settingsService.completeOnboarding();

      expect(db.settings.put).toHaveBeenCalledWith(
        expect.objectContaining({
          onboardingCompleted: true,
        })
      );
    });
  });

  describe('isOnboardingCompleted', () => {
    it('should return onboarding status', async () => {
      const completedSettings = { ...mockSettings, onboardingCompleted: true };
      (db.settings.get as jest.Mock).mockResolvedValue(completedSettings);

      const result = await settingsService.isOnboardingCompleted();

      expect(result).toBe(true);
    });
  });

  describe('shouldShowBackupReminder', () => {
    it('should return true when never backed up', async () => {
      (db.settings.get as jest.Mock).mockResolvedValue(mockSettings);

      const result = await settingsService.shouldShowBackupReminder();

      expect(result).toBe(true);
    });

    it('should return true when last backup was more than 2 weeks ago', async () => {
      const threeWeeksAgo = new Date();
      threeWeeksAgo.setDate(threeWeeksAgo.getDate() - 21);

      const settingsWithOldBackup = { ...mockSettings, lastBackupDate: threeWeeksAgo };
      (db.settings.get as jest.Mock).mockResolvedValue(settingsWithOldBackup);

      const result = await settingsService.shouldShowBackupReminder();

      expect(result).toBe(true);
    });

    it('should return false when last backup was recent', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const settingsWithRecentBackup = { ...mockSettings, lastBackupDate: yesterday };
      (db.settings.get as jest.Mock).mockResolvedValue(settingsWithRecentBackup);

      const result = await settingsService.shouldShowBackupReminder();

      expect(result).toBe(false);
    });
  });

  describe('getSystemTheme', () => {
    it('should return light theme when system prefers light', () => {
      (window.matchMedia as jest.Mock).mockReturnValue({ matches: false });

      const result = settingsService.getSystemTheme();

      expect(result).toBe('light');
    });

    it('should return dark theme when system prefers dark', () => {
      (window.matchMedia as jest.Mock).mockReturnValue({ matches: true });

      const result = settingsService.getSystemTheme();

      expect(result).toBe('dark');
    });
  });

  describe('getSystemReducedMotion', () => {
    it('should return false when system does not prefer reduced motion', () => {
      (window.matchMedia as jest.Mock).mockReturnValue({ matches: false });

      const result = settingsService.getSystemReducedMotion();

      expect(result).toBe(false);
    });

    it('should return true when system prefers reduced motion', () => {
      (window.matchMedia as jest.Mock).mockReturnValue({ matches: true });

      const result = settingsService.getSystemReducedMotion();

      expect(result).toBe(true);
    });
  });

  describe('getEffectiveTheme', () => {
    it('should return system theme when theme is set to system', async () => {
      (db.settings.get as jest.Mock).mockResolvedValue(mockSettings); // theme: 'system'
      (window.matchMedia as jest.Mock).mockReturnValue({ matches: true }); // dark

      const result = await settingsService.getEffectiveTheme();

      expect(result).toBe('dark');
    });

    it('should return user theme when not set to system', async () => {
      const settingsWithLightTheme = { ...mockSettings, theme: 'light' as const };
      (db.settings.get as jest.Mock).mockResolvedValue(settingsWithLightTheme);

      const result = await settingsService.getEffectiveTheme();

      expect(result).toBe('light');
    });
  });

  describe('getEffectiveReducedMotion', () => {
    it('should return true when user prefers reduced motion', async () => {
      const settingsWithReducedMotion = { ...mockSettings, reducedMotion: true };
      (db.settings.get as jest.Mock).mockResolvedValue(settingsWithReducedMotion);
      (window.matchMedia as jest.Mock).mockReturnValue({ matches: false });

      const result = await settingsService.getEffectiveReducedMotion();

      expect(result).toBe(true);
    });

    it('should return true when system prefers reduced motion', async () => {
      (db.settings.get as jest.Mock).mockResolvedValue(mockSettings); // reducedMotion: false
      (window.matchMedia as jest.Mock).mockReturnValue({ matches: true });

      const result = await settingsService.getEffectiveReducedMotion();

      expect(result).toBe(true);
    });

    it('should return false when neither user nor system prefers reduced motion', async () => {
      (db.settings.get as jest.Mock).mockResolvedValue(mockSettings); // reducedMotion: false
      (window.matchMedia as jest.Mock).mockReturnValue({ matches: false });

      const result = await settingsService.getEffectiveReducedMotion();

      expect(result).toBe(false);
    });
  });
});
