import { StorageManager } from '../utils/storage';
import { PlatformManager } from '../utils/platform';
import { Logger } from '../utils/logger';
import { CommandOptions, CommandResult } from '../types';

export class UpdateCommand {
  private storage: StorageManager;
  private platform: PlatformManager;
  private logger: Logger;

  constructor(verbose: boolean = false) {
    this.storage = new StorageManager();
    this.platform = new PlatformManager();
    this.logger = new Logger(verbose);
  }

  public execute(name: string, newPath?: string, description?: string, options: CommandOptions = {}): CommandResult {
    try {
      this.logger.debug(`Updating shortcut: ${name}`);

      // Check if shortcut exists
      const existingShortcut = this.storage.getShortcut(name);
      if (!existingShortcut) {
        const message = `Shortcut '${name}' does not exist`;
        this.logger.error(message);
        return {
          success: false,
          message
        };
      }

      // Resolve new path if provided
      let resolvedPath: string | undefined;
      if (newPath) {
        resolvedPath = this.platform.resolvePath(newPath);
        this.logger.debug(`Resolved new path: ${resolvedPath}`);
      }

      // Update the shortcut
      const result = this.storage.updateShortcut(name, resolvedPath, description);

      if (result.success) {
        this.logger.success(result.message);
        
        if (options.verbose && result.data) {
          this.logger.info(`Updated shortcut details:`);
          this.logger.info(`  Name: ${result.data.name}`);
          this.logger.info(`  Path: ${result.data.path}`);
          this.logger.info(`  Created: ${new Date(result.data.createdAt).toLocaleString()}`);
          if (result.data.description) {
            this.logger.info(`  Description: ${result.data.description}`);
          }
        }
      } else {
        this.logger.error(result.message);
      }

      return result;
    } catch (error) {
      const errorMessage = `Failed to update shortcut: ${error}`;
      this.logger.error(errorMessage);
      return {
        success: false,
        message: errorMessage
      };
    }
  }

  public showHelp(): void {
    this.logger.header('pathbunny update - Update a directory shortcut');
    console.log('Usage:');
    console.log('  pathbunny update <name> <path>        Update shortcut path');
    console.log('  pathbunny update <name> . -d "desc"   Update to current dir with description');
    console.log('  pathbunny update <name> --desc "new"  Update only description');
    console.log();
    console.log('Options:');
    console.log('  -d, --description <desc>        Update description');
    console.log('  -v, --verbose                   Show detailed output');
    console.log();
    console.log('Examples:');
    console.log('  pathbunny update github ~/new/path    Update github shortcut path');
    console.log('  pathbunny update docs . -d "New docs" Update to current directory');
    console.log('  pathbunny update projects --desc "My projects folder"');
  }
}
