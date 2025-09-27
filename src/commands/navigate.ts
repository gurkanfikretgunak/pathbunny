import { StorageManager } from '../utils/storage';
import { PlatformManager } from '../utils/platform';
import { Logger } from '../utils/logger';
import { NavigateOptions, CommandResult } from '../types';

export class NavigateCommand {
  private storage: StorageManager;
  private platform: PlatformManager;
  private logger: Logger;

  constructor(verbose: boolean = false) {
    this.storage = new StorageManager();
    this.platform = new PlatformManager();
    this.logger = new Logger(verbose);
  }

  public execute(name: string, options: NavigateOptions = {}): CommandResult {
    try {
      this.logger.debug(`Navigating to shortcut: ${name}`);

      // Get the shortcut
      const shortcut = this.storage.getShortcut(name);
      
      if (!shortcut) {
        const availableShortcuts = this.storage.listShortcuts();
        const message = availableShortcuts.length > 0 
          ? `Shortcut '${name}' not found. Available shortcuts: ${availableShortcuts.map(s => s.name).join(', ')}`
          : `Shortcut '${name}' not found. No shortcuts available. Use 'pathbunny add <name> <path>' to create one.`;
        
        this.logger.error(message);
        return {
          success: false,
          message
        };
      }

      this.logger.debug(`Found shortcut: ${shortcut.path}`);

      // Check if path still exists
      const fs = require('fs');
      if (!fs.existsSync(shortcut.path)) {
        const message = `Path no longer exists: ${shortcut.path}. Consider updating or removing this shortcut.`;
        this.logger.error(message);
        return {
          success: false,
          message
        };
      }

      // Mark as used
      this.storage.markAsUsed(name);

      // Navigate to the path
      const result = this.platform.navigateToPath(shortcut.path, {
        newWindow: options.newWindow,
        shell: options.shell
      });

      if (result.success) {
        if (options.newWindow) {
          this.logger.success(`Opened new terminal window at: ${shortcut.path}`);
        } else {
          this.logger.debug(`Navigation command: ${result.data?.command}`);
          // The actual navigation happens via the shell script wrapper
          // We just output the cd command for the wrapper to execute
        }
      }

      return result;
    } catch (error) {
      const errorMessage = `Failed to navigate to '${name}': ${error}`;
      this.logger.error(errorMessage);
      return {
        success: false,
        message: errorMessage
      };
    }
  }

  public showHelp(): void {
    this.logger.header('pathbunny navigate - Navigate to a directory shortcut');
    console.log('Usage:');
    console.log('  pathbunny <name>                      Navigate to shortcut');
    console.log('  pathbunny <name> --new-window         Open in new terminal window');
    console.log('  pathbunny <name> --shell <shell>      Use specific shell');
    console.log();
    console.log('Options:');
    console.log('  -n, --new-window                Open in new terminal window');
    console.log('  -s, --shell <shell>             Use specific shell (bash, zsh, etc.)');
    console.log('  -v, --verbose                   Show detailed output');
    console.log();
    console.log('Examples:');
    console.log('  pathbunny github                      Navigate to github shortcut');
    console.log('  pathbunny projects --new-window       Open projects in new terminal');
    console.log('  pathbunny docs --shell bash           Navigate using bash shell');
  }
}
