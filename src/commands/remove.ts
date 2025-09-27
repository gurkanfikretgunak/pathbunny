import { StorageManager } from '../utils/storage';
import { Logger } from '../utils/logger';
import { CommandOptions, CommandResult } from '../types';
import inquirer from 'inquirer';

export class RemoveCommand {
  private storage: StorageManager;
  private logger: Logger;

  constructor(verbose: boolean = false) {
    this.storage = new StorageManager();
    this.logger = new Logger(verbose);
  }

  public async execute(name: string, options: CommandOptions = {}): Promise<CommandResult> {
    try {
      this.logger.debug(`Removing shortcut: ${name}`);

      // Check if shortcut exists
      const shortcut = this.storage.getShortcut(name);
      if (!shortcut) {
        const message = `Shortcut '${name}' does not exist`;
        this.logger.error(message);
        return {
          success: false,
          message
        };
      }

      // Confirm removal unless forced
      if (!options.force && options.interactive !== false) {
        const answer = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirm',
            message: `Are you sure you want to remove shortcut '${name}' (${shortcut.path})?`,
            default: false
          }
        ]);

        if (!answer.confirm) {
          this.logger.info('Removal cancelled');
          return {
            success: false,
            message: 'Removal cancelled by user'
          };
        }
      }

      // Remove the shortcut
      const result = this.storage.removeShortcut(name);

      if (result.success) {
        this.logger.success(result.message);
        
        if (options.verbose) {
          this.logger.info(`Removed shortcut details:`);
          this.logger.info(`  Name: ${shortcut.name}`);
          this.logger.info(`  Path: ${shortcut.path}`);
          this.logger.info(`  Created: ${new Date(shortcut.createdAt).toLocaleString()}`);
        }
      } else {
        this.logger.error(result.message);
      }

      return result;
    } catch (error) {
      const errorMessage = `Failed to remove shortcut: ${error}`;
      this.logger.error(errorMessage);
      return {
        success: false,
        message: errorMessage
      };
    }
  }

  public showHelp(): void {
    this.logger.header('pathbunny remove - Remove a directory shortcut');
    console.log('Usage:');
    console.log('  pathbunny remove <name>               Remove shortcut with confirmation');
    console.log('  pathbunny remove <name> --force       Remove without confirmation');
    console.log();
    console.log('Options:');
    console.log('  -f, --force                     Remove without confirmation');
    console.log('  -v, --verbose                   Show detailed output');
    console.log('  --no-interactive                Skip confirmation prompt');
    console.log();
    console.log('Examples:');
    console.log('  pathbunny remove github               Remove github shortcut');
    console.log('  pathbunny remove old-project --force  Remove without asking');
  }
}
