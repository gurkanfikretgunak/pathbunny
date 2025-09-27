/**
 * pathbunny CLI Types and Interfaces
 */

export interface Shortcut {
  name: string;
  path: string;
  createdAt: string;
  lastUsed?: string;
  description?: string;
}

export interface ShortcutStorage {
  shortcuts: Record<string, Shortcut>;
  version: string;
  createdAt: string;
  lastUpdated: string;
}

export interface CommandOptions {
  verbose?: boolean;
  force?: boolean;
  interactive?: boolean;
}

export interface AddCommandOptions extends CommandOptions {
  description?: string;
}

export interface ListCommandOptions extends CommandOptions {
  format?: 'table' | 'json' | 'simple';
  sort?: 'name' | 'path' | 'created' | 'used';
}

export interface NavigateOptions extends CommandOptions {
  newWindow?: boolean;
  shell?: string;
}

export type CommandResult = {
  success: boolean;
  message: string;
  data?: any;
};

export type Platform = 'darwin' | 'win32' | 'linux';

export interface PlatformConfig {
  shell: string;
  cdCommand: string;
  pathSeparator: string;
  homeDir: string;
}
