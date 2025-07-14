// Settings service for managing user preferences and app settings
import { db } from '@/lib/db';
import { validateAppSettings } from '@/lib/validation/schemas';
import type { AppSettings, TextSize, Theme, UserPreferences, ViewMode } from '@/types';

export class SettingsService {
  private readonly SETTINGS_ID = 'default';

  /**
   * Get current app settings
   */
  async getSettings(): Promise<AppSettings> {
    try {
      let settings = await db.settings.get(this.SETTINGS_ID);

      if (!settings) {
        // Create default settings if none exist
        settings = await this.createDefaultSettings();
      }

      return settings;
    } catch (error) {
      throw new Error(`Failed to fetch settings: ${error}`);
    }
  }

  /**
   * Update app settings
   */
  async updateSettings(updates: Partial<AppSettings>): Promise<AppSettings> {
    try {
      const currentSettings = await this.getSettings();

      // Merge updates with current settings
      const updatedSettings: AppSettings = {
        ...currentSettings,
        ...updates,
        id: this.SETTINGS_ID, // Ensure ID remains constant
      };

      // Validate updated settings
      const validation = validateAppSettings(updatedSettings);
      if (!validation.success) {
        throw new Error(`Settings validation failed: ${validation.error.message}`);
      }

      // Update in database
      await db.settings.put(updatedSettings);

      return updatedSettings;
    } catch (error) {
      throw new Error(`Failed to update settings: ${error}`);
    }
  }

  /**
   * Get user preferences (subset of settings)
   */
  async getUserPreferences(): Promise<UserPreferences> {
    try {
      const settings = await this.getSettings();

      return {
        theme: settings.theme,
        textSize: settings.textSize,
        highContrast: settings.highContrast,
        reducedMotion: settings.reducedMotion,
        backupReminders: settings.lastBackupDate !== null, // Simple heuristic
      };
    } catch (error) {
      throw new Error(`Failed to fetch user preferences: ${error}`);
    }
  }

  /**
   * Update user preferences
   */
  async updateUserPreferences(preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    try {
      const settingsUpdates: Partial<AppSettings> = {};

      if (preferences.theme !== undefined) {
        settingsUpdates.theme = preferences.theme;
      }

      if (preferences.textSize !== undefined) {
        settingsUpdates.textSize = preferences.textSize;
      }

      if (preferences.highContrast !== undefined) {
        settingsUpdates.highContrast = preferences.highContrast;
      }

      if (preferences.reducedMotion !== undefined) {
        settingsUpdates.reducedMotion = preferences.reducedMotion;
      }

      await this.updateSettings(settingsUpdates);

      return await this.getUserPreferences();
    } catch (error) {
      throw new Error(`Failed to update user preferences: ${error}`);
    }
  }

  /**
   * Set current view mode
   */
  async setCurrentView(view: ViewMode): Promise<void> {
    try {
      await this.updateSettings({ currentView: view });
    } catch (error) {
      throw new Error(`Failed to set current view: ${error}`);
    }
  }

  /**
   * Get current view mode
   */
  async getCurrentView(): Promise<ViewMode> {
    try {
      const settings = await this.getSettings();
      return settings.currentView;
    } catch (error) {
      throw new Error(`Failed to get current view: ${error}`);
    }
  }

  /**
   * Set theme
   */
  async setTheme(theme: Theme): Promise<void> {
    try {
      await this.updateSettings({ theme });
    } catch (error) {
      throw new Error(`Failed to set theme: ${error}`);
    }
  }

  /**
   * Get theme
   */
  async getTheme(): Promise<Theme> {
    try {
      const settings = await this.getSettings();
      return settings.theme;
    } catch (error) {
      throw new Error(`Failed to get theme: ${error}`);
    }
  }

  /**
   * Set text size
   */
  async setTextSize(textSize: TextSize): Promise<void> {
    try {
      await this.updateSettings({ textSize });
    } catch (error) {
      throw new Error(`Failed to set text size: ${error}`);
    }
  }

  /**
   * Get text size
   */
  async getTextSize(): Promise<TextSize> {
    try {
      const settings = await this.getSettings();
      return settings.textSize;
    } catch (error) {
      throw new Error(`Failed to get text size: ${error}`);
    }
  }

  /**
   * Set high contrast mode
   */
  async setHighContrast(enabled: boolean): Promise<void> {
    try {
      await this.updateSettings({ highContrast: enabled });
    } catch (error) {
      throw new Error(`Failed to set high contrast: ${error}`);
    }
  }

  /**
   * Get high contrast mode
   */
  async getHighContrast(): Promise<boolean> {
    try {
      const settings = await this.getSettings();
      return settings.highContrast;
    } catch (error) {
      throw new Error(`Failed to get high contrast: ${error}`);
    }
  }

  /**
   * Set reduced motion preference
   */
  async setReducedMotion(enabled: boolean): Promise<void> {
    try {
      await this.updateSettings({ reducedMotion: enabled });
    } catch (error) {
      throw new Error(`Failed to set reduced motion: ${error}`);
    }
  }

  /**
   * Get reduced motion preference
   */
  async getReducedMotion(): Promise<boolean> {
    try {
      const settings = await this.getSettings();
      return settings.reducedMotion;
    } catch (error) {
      throw new Error(`Failed to get reduced motion: ${error}`);
    }
  }

  /**
   * Mark onboarding as completed
   */
  async completeOnboarding(): Promise<void> {
    try {
      await this.updateSettings({ onboardingCompleted: true });
    } catch (error) {
      throw new Error(`Failed to complete onboarding: ${error}`);
    }
  }

  /**
   * Check if onboarding is completed
   */
  async isOnboardingCompleted(): Promise<boolean> {
    try {
      const settings = await this.getSettings();
      return settings.onboardingCompleted;
    } catch (error) {
      throw new Error(`Failed to check onboarding status: ${error}`);
    }
  }

  /**
   * Reset onboarding status
   */
  async resetOnboarding(): Promise<void> {
    try {
      await this.updateSettings({ onboardingCompleted: false });
    } catch (error) {
      throw new Error(`Failed to reset onboarding: ${error}`);
    }
  }

  /**
   * Update last backup date
   */
  async updateLastBackupDate(date: Date = new Date()): Promise<void> {
    try {
      await this.updateSettings({ lastBackupDate: date });
    } catch (error) {
      throw new Error(`Failed to update last backup date: ${error}`);
    }
  }

  /**
   * Get last backup date
   */
  async getLastBackupDate(): Promise<Date | null> {
    try {
      const settings = await this.getSettings();
      return settings.lastBackupDate;
    } catch (error) {
      throw new Error(`Failed to get last backup date: ${error}`);
    }
  }

  /**
   * Check if backup reminder should be shown (2 weeks since last backup)
   */
  async shouldShowBackupReminder(): Promise<boolean> {
    try {
      const lastBackupDate = await this.getLastBackupDate();

      if (!lastBackupDate) {
        return true; // Show reminder if never backed up
      }

      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

      return lastBackupDate < twoWeeksAgo;
    } catch (error) {
      throw new Error(`Failed to check backup reminder status: ${error}`);
    }
  }

  /**
   * Reset all settings to defaults
   */
  async resetToDefaults(): Promise<AppSettings> {
    try {
      const defaultSettings: AppSettings = {
        id: this.SETTINGS_ID,
        lastBackupDate: null,
        currentView: 'category',
        theme: 'system',
        textSize: 'default',
        highContrast: false,
        reducedMotion: false,
        onboardingCompleted: false,
      };

      await db.settings.put(defaultSettings);
      return defaultSettings;
    } catch (error) {
      throw new Error(`Failed to reset settings: ${error}`);
    }
  }

  /**
   * Export settings for backup
   */
  async exportSettings(): Promise<AppSettings> {
    try {
      return await this.getSettings();
    } catch (error) {
      throw new Error(`Failed to export settings: ${error}`);
    }
  }

  /**
   * Import settings from backup
   */
  async importSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
    try {
      // Ensure ID is correct
      const settingsToImport = {
        ...settings,
        id: this.SETTINGS_ID,
      };

      // Validate imported settings
      const validation = validateAppSettings(settingsToImport);
      if (!validation.success) {
        throw new Error(`Invalid settings data: ${validation.error.message}`);
      }

      await db.settings.put(settingsToImport as AppSettings);
      return settingsToImport as AppSettings;
    } catch (error) {
      throw new Error(`Failed to import settings: ${error}`);
    }
  }

  /**
   * Create default settings
   */
  private async createDefaultSettings(): Promise<AppSettings> {
    try {
      const defaultSettings: AppSettings = {
        id: this.SETTINGS_ID,
        lastBackupDate: null,
        currentView: 'category',
        theme: 'system',
        textSize: 'default',
        highContrast: false,
        reducedMotion: false,
        onboardingCompleted: false,
      };

      await db.settings.add(defaultSettings);
      return defaultSettings;
    } catch (error) {
      throw new Error(`Failed to create default settings: ${error}`);
    }
  }

  /**
   * Get system theme preference
   */
  getSystemTheme(): Theme {
    if (typeof window === 'undefined') {
      return 'light'; // Default for SSR
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  /**
   * Get system reduced motion preference
   */
  getSystemReducedMotion(): boolean {
    if (typeof window === 'undefined') {
      return false; // Default for SSR
    }

    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * Get effective theme (resolves 'system' to actual theme)
   */
  async getEffectiveTheme(): Promise<'light' | 'dark'> {
    try {
      const theme = await this.getTheme();

      if (theme === 'system') {
        return this.getSystemTheme() as 'light' | 'dark';
      }

      return theme as 'light' | 'dark';
    } catch (error) {
      throw new Error(`Failed to get effective theme: ${error}`);
    }
  }

  /**
   * Get effective reduced motion (considers both user setting and system preference)
   */
  async getEffectiveReducedMotion(): Promise<boolean> {
    try {
      const userPreference = await this.getReducedMotion();
      const systemPreference = this.getSystemReducedMotion();

      // Return true if either user or system prefers reduced motion
      return userPreference || systemPreference;
    } catch (error) {
      throw new Error(`Failed to get effective reduced motion: ${error}`);
    }
  }
}

// Export singleton instance
export const settingsService = new SettingsService();
