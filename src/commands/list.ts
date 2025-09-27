import { StorageManager } from '../utils/storage';
import { Logger } from '../utils/logger';
import { ListCommandOptions, CommandResult, Shortcut } from '../types';
import chalk from 'chalk';

export class ListCommand {
  private storage: StorageManager;
  private logger: Logger;

  constructor(verbose: boolean = false) {
    this.storage = new StorageManager();
    this.logger = new Logger(verbose);
  }

  public execute(options: ListCommandOptions = {}): CommandResult {
    try {
      const shortcuts = this.storage.listShortcuts();

      if (shortcuts.length === 0) {
        this.logger.info('No shortcuts found. Use "pathbunny add <name> <path>" to create your first shortcut.');
        return {
          success: true,
          message: 'No shortcuts found',
          data: []
        };
      }

      // Sort shortcuts
      const sortedShortcuts = this.sortShortcuts(shortcuts, options.sort || 'name');

      // Display shortcuts based on format
      switch (options.format) {
        case 'json':
          this.logger.json(sortedShortcuts);
          break;
        case 'simple':
          this.displaySimpleFormat(sortedShortcuts);
          break;
        case 'table':
        default:
          this.displayTableFormat(sortedShortcuts, options.verbose);
          break;
      }

      return {
        success: true,
        message: `Found ${shortcuts.length} shortcut${shortcuts.length !== 1 ? 's' : ''}`,
        data: sortedShortcuts
      };
    } catch (error) {
      const errorMessage = `Failed to list shortcuts: ${error}`;
      this.logger.error(errorMessage);
      return {
        success: false,
        message: errorMessage
      };
    }
  }

  private sortShortcuts(shortcuts: Shortcut[], sortBy: string): Shortcut[] {
    return shortcuts.sort((a, b) => {
      switch (sortBy) {
        case 'path':
          return a.path.localeCompare(b.path);
        case 'created':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'used':
          const aUsed = a.lastUsed ? new Date(a.lastUsed).getTime() : 0;
          const bUsed = b.lastUsed ? new Date(b.lastUsed).getTime() : 0;
          return bUsed - aUsed; // Most recently used first
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });
  }

  private displaySimpleFormat(shortcuts: Shortcut[]): void {
    shortcuts.forEach(shortcut => {
      console.log(`${chalk.cyan(shortcut.name)} → ${shortcut.path}`);
    });
  }

  private displayTableFormat(shortcuts: Shortcut[], verbose?: boolean): void {
    this.logger.header(`Directory Shortcuts (${shortcuts.length})`);

    const maxNameLength = Math.max(...shortcuts.map(s => s.name.length), 4);
    const maxPathLength = Math.max(...shortcuts.map(s => s.path.length), 4);

    // Header
    const nameHeader = 'NAME'.padEnd(maxNameLength);
    const pathHeader = 'PATH'.padEnd(maxPathLength);
    console.log(chalk.bold(`${nameHeader} │ ${pathHeader}${verbose ? ' │ CREATED' : ''}`));
    console.log('─'.repeat(maxNameLength) + '─┼─' + '─'.repeat(maxPathLength) + (verbose ? '─┼─────────' : ''));

    // Rows
    shortcuts.forEach(shortcut => {
      const name = chalk.cyan(shortcut.name.padEnd(maxNameLength));
      const path = shortcut.path.padEnd(maxPathLength);
      const created = verbose ? ` │ ${new Date(shortcut.createdAt).toLocaleDateString()}` : '';
      
      console.log(`${name} │ ${path}${created}`);
      
      if (verbose && shortcut.description) {
        console.log(`${' '.repeat(maxNameLength)} │ ${chalk.gray(shortcut.description)}`);
      }
      
      if (verbose && shortcut.lastUsed) {
        const lastUsed = new Date(shortcut.lastUsed).toLocaleString();
        console.log(`${' '.repeat(maxNameLength)} │ ${chalk.gray(`Last used: ${lastUsed}`)}`);
      }
    });

    console.log();
    this.logger.info(`Use ${chalk.cyan('pathbunny <name>')} to navigate to a shortcut`);
  }

  public showHelp(): void {
    this.logger.header('pathbunny list - List all directory shortcuts');
    console.log('Usage:');
    console.log('  pathbunny list                        List all shortcuts in table format');
    console.log('  pathbunny list --format simple        List shortcuts in simple format');
    console.log('  pathbunny list --format json          List shortcuts in JSON format');
    console.log('  pathbunny list --sort name            Sort by name (default)');
    console.log('  pathbunny list --sort path            Sort by path');
    console.log('  pathbunny list --sort created         Sort by creation date');
    console.log('  pathbunny list --sort used            Sort by last used date');
    console.log();
    console.log('Options:');
    console.log('  --format <format>               Output format: table, simple, json');
    console.log('  --sort <field>                  Sort by: name, path, created, used');
    console.log('  -v, --verbose                   Show detailed information');
    console.log();
    console.log('Examples:');
    console.log('  pathbunny list');
    console.log('  pathbunny list --format simple --sort used');
    console.log('  pathbunny list -v --sort created');
  }
}
