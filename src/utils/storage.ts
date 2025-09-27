import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { Shortcut, ShortcutStorage, CommandResult } from '../types';

export class StorageManager {
  private storagePath: string;
  private storage: ShortcutStorage;

  constructor() {
    // Create .pathbunny directory in user's home directory
    const homeDir = os.homedir();
    const pbDir = path.join(homeDir, '.pathbunny');
    this.storagePath = path.join(pbDir, 'storage.json');
    
    this.ensureStorageDirectory();
    this.storage = this.loadStorage();
    this.seedDefaultsForPlatform();
  }

  private ensureStorageDirectory(): void {
    const dir = path.dirname(this.storagePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private seedDefaultsForPlatform(): void {
    // Seed only if empty
    if (Object.keys(this.storage.shortcuts).length > 0) return;

    const platform = os.platform();
    const homeDir = os.homedir();

    const candidateDirs: Array<{ key: string; absolutePath: string; description?: string }> = [];

    if (platform === 'darwin') {
      candidateDirs.push(
        { key: 'docs', absolutePath: path.join(homeDir, 'Documents'), description: 'Documents folder' },
        { key: 'downloads', absolutePath: path.join(homeDir, 'Downloads'), description: 'Downloads folder' },
        { key: 'desktop', absolutePath: path.join(homeDir, 'Desktop'), description: 'Desktop folder' },
        { key: 'github', absolutePath: path.join(homeDir, 'Documents', 'GitHub'), description: 'GitHub projects' },
        { key: 'projects', absolutePath: path.join(homeDir, 'Projects'), description: 'Projects root' },
        { key: 'dev', absolutePath: path.join(homeDir, 'Development'), description: 'Development root' }
      );
    }

    // Add only existing directories
    candidateDirs.forEach(entry => {
      try {
        if (fs.existsSync(entry.absolutePath) && fs.statSync(entry.absolutePath).isDirectory()) {
          this.storage.shortcuts[entry.key] = {
            name: entry.key,
            path: entry.absolutePath,
            createdAt: new Date().toISOString(),
            description: entry.description
          };
        }
      } catch { /* ignore */ }
    });

    // Save if anything was added
    if (Object.keys(this.storage.shortcuts).length > 0) {
      this.saveStorage();
    }
  }

  private loadStorage(): ShortcutStorage {
    try {
      if (fs.existsSync(this.storagePath)) {
        const data = fs.readFileSync(this.storagePath, 'utf8');
        const parsed = JSON.parse(data);
        
        // Migrate old format if necessary
        if (!parsed.version) {
          return this.migrateOldFormat(parsed);
        }
        
        return parsed;
      }
    } catch (error) {
      console.warn(`Warning: Could not load storage file: ${error}`);
    }

    // Return default storage structure
    return {
      shortcuts: {},
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
  }

  private migrateOldFormat(oldData: Record<string, string>): ShortcutStorage {
    const shortcuts: Record<string, Shortcut> = {};
    
    Object.entries(oldData).forEach(([name, path]) => {
      shortcuts[name] = {
        name,
        path,
        createdAt: new Date().toISOString()
      };
    });

    return {
      shortcuts,
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
  }

  private saveStorage(): CommandResult {
    try {
      this.storage.lastUpdated = new Date().toISOString();
      const data = JSON.stringify(this.storage, null, 2);
      fs.writeFileSync(this.storagePath, data, 'utf8');
      return { success: true, message: 'Storage saved successfully' };
    } catch (error) {
      return { 
        success: false, 
        message: `Failed to save storage: ${error}` 
      };
    }
  }

  public addShortcut(name: string, targetPath: string, description?: string, force: boolean = false): CommandResult {
    // Validate inputs
    if (!name || !targetPath) {
      return { 
        success: false, 
        message: 'Name and path are required' 
      };
    }

    // Resolve path
    const resolvedPath = path.resolve(targetPath);
    
    // Check if path exists
    if (!fs.existsSync(resolvedPath)) {
      return { 
        success: false, 
        message: `Path does not exist: ${resolvedPath}` 
      };
    }

    // Check if it's a directory
    const stats = fs.statSync(resolvedPath);
    if (!stats.isDirectory()) {
      return { 
        success: false, 
        message: `Path is not a directory: ${resolvedPath}` 
      };
    }

    // Check if shortcut already exists
    if (this.storage.shortcuts[name] && !force) {
      return { 
        success: false, 
        message: `Shortcut '${name}' already exists. Use 'pathbunny update' to modify it or use --force to overwrite.` 
      };
    }

    // Add the shortcut
    this.storage.shortcuts[name] = {
      name,
      path: resolvedPath,
      createdAt: new Date().toISOString(),
      description
    };

    const saveResult = this.saveStorage();
    if (!saveResult.success) {
      return saveResult;
    }

    return { 
      success: true, 
      message: `Shortcut '${name}' added successfully → ${resolvedPath}`,
      data: this.storage.shortcuts[name]
    };
  }

  public getShortcut(name: string): Shortcut | null {
    return this.storage.shortcuts[name] || null;
  }

  public listShortcuts(): Shortcut[] {
    return Object.values(this.storage.shortcuts);
  }

  public removeShortcut(name: string): CommandResult {
    if (!this.storage.shortcuts[name]) {
      return { 
        success: false, 
        message: `Shortcut '${name}' does not exist` 
      };
    }

    delete this.storage.shortcuts[name];
    const saveResult = this.saveStorage();
    
    if (!saveResult.success) {
      return saveResult;
    }

    return { 
      success: true, 
      message: `Shortcut '${name}' removed successfully` 
    };
  }

  public updateShortcut(name: string, newPath?: string, description?: string): CommandResult {
    if (!this.storage.shortcuts[name]) {
      return { 
        success: false, 
        message: `Shortcut '${name}' does not exist` 
      };
    }

    const shortcut = this.storage.shortcuts[name];

    if (newPath) {
      const resolvedPath = path.resolve(newPath);
      
      if (!fs.existsSync(resolvedPath)) {
        return { 
          success: false, 
          message: `Path does not exist: ${resolvedPath}` 
        };
      }

      const stats = fs.statSync(resolvedPath);
      if (!stats.isDirectory()) {
        return { 
          success: false, 
          message: `Path is not a directory: ${resolvedPath}` 
        };
      }

      shortcut.path = resolvedPath;
    }

    if (description !== undefined) {
      shortcut.description = description;
    }

    const saveResult = this.saveStorage();
    if (!saveResult.success) {
      return saveResult;
    }

    return { 
      success: true, 
      message: `Shortcut '${name}' updated successfully`,
      data: shortcut
    };
  }

  public markAsUsed(name: string): void {
    if (this.storage.shortcuts[name]) {
      this.storage.shortcuts[name].lastUsed = new Date().toISOString();
      this.saveStorage();
    }
  }

  public getStoragePath(): string {
    return this.storagePath;
  }

  public exportShortcuts(): CommandResult {
    try {
      return {
        success: true,
        message: 'Shortcuts exported successfully',
        data: this.storage
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to export shortcuts: ${error}`
      };
    }
  }
}
