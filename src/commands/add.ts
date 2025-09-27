import { StorageManager } from '../utils/storage';
import { PlatformManager } from '../utils/platform';
import { Logger } from '../utils/logger';
import { AddCommandOptions, CommandResult } from '../types';

export class AddCommand {
  private storage: StorageManager;
  private platform: PlatformManager;
  private logger: Logger;

  constructor(verbose: boolean = false) {
    this.storage = new StorageManager();
    this.platform = new PlatformManager();
    this.logger = new Logger(verbose);
  }

  public execute(name: string, targetPath: string, options: AddCommandOptions = {}): CommandResult {
    try {
      this.logger.debug(`Adding shortcut: ${name} → ${targetPath}`);

      // Resolve the path (handle ., ~, etc.)
      const resolvedPath = this.platform.resolvePath(targetPath);
      this.logger.debug(`Resolved path: ${resolvedPath}`);

      // Add the shortcut using storage manager
      const result = this.storage.addShortcut(name, resolvedPath, options.description, options.force);

      if (result.success) {
        this.logger.success(result.message);
        
        if (options.verbose && result.data) {
          this.logger.info(`Details:`);
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
      const errorMessage = `Failed to add shortcut: ${error}`;
      this.logger.error(errorMessage);
      return {
        success: false,
        message: errorMessage
      };
    }
  }

  public showHelp(): void {
    this.logger.header('pathbunny add - Add a new directory shortcut');
    console.log('Usage:');
    console.log('  pathbunny add <name> <path>           Add shortcut with name and path');
    console.log('  pathbunny add <name> .                Add shortcut for current directory');
    console.log('  pathbunny add <name> ~                Add shortcut for home directory');
    console.log('  pathbunny add <name> <path> -d "desc" Add shortcut with description');
    console.log();
    console.log('Options:');
    console.log('  -d, --description <desc>        Add a description to the shortcut');
    console.log('  -v, --verbose                   Show detailed output');
    console.log('  -f, --force                     Overwrite existing shortcut');
    console.log();
    console.log('Examples:');
    console.log('  pathbunny add github ~/Documents/GitHub');
    console.log('  pathbunny add projects .');
    console.log('  pathbunny add docs ~/Documents -d "My documents folder"');
  }
}
