#!/usr/bin/env node

import { Command } from 'commander';
import { AddCommand } from './commands/add';
import { ListCommand } from './commands/list';
import { NavigateCommand } from './commands/navigate';
import { RemoveCommand } from './commands/remove';
import { UpdateCommand } from './commands/update';
import { StorageManager } from './utils/storage';
import { PlatformManager } from './utils/platform';
import { Logger } from './utils/logger';
import chalk from 'chalk';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

const program = new Command();
const logger = new Logger();

// Package info
const packageJson = require('../package.json');

program
  .name('pathbunny')
  .description('A powerful CLI tool for managing directory shortcuts and quick navigation')
  .version(packageJson.version);

// Global options
program
  .option('-v, --verbose', 'enable verbose logging')
  .option('--no-interactive', 'disable interactive prompts');

// Add command
program
  .command('add <name> <path>')
  .description('add a new directory shortcut')
  .option('-d, --description <desc>', 'add a description to the shortcut')
  .option('-f, --force', 'overwrite existing shortcut')
  .action(async (name: string, path: string, options: any) => {
    const addCommand = new AddCommand(program.opts().verbose);
    const result = addCommand.execute(name, path, {
      description: options.description,
      force: options.force,
      verbose: program.opts().verbose
    });
    
    process.exit(result.success ? 0 : 1);
  });

// List command
program
  .command('list')
  .alias('ls')
  .description('list all directory shortcuts')
  .option('--format <format>', 'output format: table, simple, json', 'table')
  .option('--sort <field>', 'sort by: name, path, created, used', 'name')
  .action(async (options: any) => {
    const listCommand = new ListCommand(program.opts().verbose);
    const result = listCommand.execute({
      format: options.format,
      sort: options.sort,
      verbose: program.opts().verbose
    });
    
    process.exit(result.success ? 0 : 1);
  });

// Remove command
program
  .command('remove <name>')
  .alias('rm')
  .description('remove a directory shortcut')
  .option('-f, --force', 'remove without confirmation')
  .action(async (name: string, options: any) => {
    const removeCommand = new RemoveCommand(program.opts().verbose);
    const result = await removeCommand.execute(name, {
      force: options.force,
      interactive: program.opts().interactive,
      verbose: program.opts().verbose
    });
    
    process.exit(result.success ? 0 : 1);
  });

// Update command
program
  .command('update <name> [path]')
  .description('update a directory shortcut')
  .option('-d, --description <desc>', 'update description')
  .action(async (name: string, path: string | undefined, options: any) => {
    const updateCommand = new UpdateCommand(program.opts().verbose);
    const result = updateCommand.execute(name, path, options.description, {
      verbose: program.opts().verbose
    });
    
    process.exit(result.success ? 0 : 1);
  });

// Export command
program
  .command('export')
  .description('export shortcuts to JSON')
  .action(async () => {
    try {
      const storage = new StorageManager();
      const result = storage.exportShortcuts();
      
      if (result.success) {
        logger.json(result.data);
      } else {
        logger.error(result.message);
        process.exit(1);
      }
    } catch (error) {
      logger.error(`Export failed: ${error}`);
      process.exit(1);
    }
  });

// Info command
program
  .command('info')
  .description('show pathbunny configuration and system information')
  .action(async () => {
    try {
      const storage = new StorageManager();
      const platform = new PlatformManager();
      const shortcuts = storage.listShortcuts();
      
      // ASCII Art Logo
      console.log();
      console.log(chalk.cyan('                    ╭─────────────────────────────────────╮'));
      console.log(chalk.cyan('                    │                                     │'));
      console.log(chalk.cyan('                    │    ') + chalk.white('🐰  ') + chalk.bold.white('pathbunny') + chalk.white('  🚀') + chalk.cyan('         │'));
      console.log(chalk.cyan('                    │                                     │'));
      console.log(chalk.cyan('                    │  ') + chalk.gray('Lightning fast directory navigation') + chalk.cyan('  │'));
      console.log(chalk.cyan('                    │                                     │'));
      console.log(chalk.cyan('                    ╰─────────────────────────────────────╯'));
      console.log();
      
      logger.header('System Information');
      
      console.log(chalk.bold('🏷️  Version:'), chalk.green(packageJson.version));
      console.log(chalk.bold('💻 Platform:'), chalk.blue(platform.getPlatform()));
      console.log(chalk.bold('🐚 Shell:'), chalk.yellow(platform.getConfig().shell));
      console.log(chalk.bold('💾 Storage:'), chalk.gray(storage.getStoragePath()));
      console.log(chalk.bold('📁 Shortcuts:'), chalk.magenta(shortcuts.length.toString()));
      
      if (shortcuts.length > 0) {
        console.log();
        console.log(chalk.bold('📌 Recent shortcuts:'));
        shortcuts
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5)
          .forEach(shortcut => {
            console.log(`   ${chalk.cyan('▸')} ${chalk.bold.white(shortcut.name)} ${chalk.gray('→')} ${chalk.dim(shortcut.path)}`);
          });
        
        console.log();
        console.log(chalk.dim('💡 Use'), chalk.cyan('pathbunny <name>'), chalk.dim('to navigate to any shortcut'));
      } else {
        console.log();
        console.log(chalk.yellow('📝 No shortcuts found. Create one with:'), chalk.cyan('pathbunny add <name> <path>'));
      }
      
      console.log();
    } catch (error) {
      logger.error(`Info command failed: ${error}`);
      process.exit(1);
    }
  });

// Setup command (creates shell integration script)
program
  .command('setup')
  .description('setup shell integration for directory navigation')
  .action(async () => {
    try {
      const platform = new PlatformManager();
      const result = platform.createShellScript();
      
      if (result.success) {
        logger.success(result.message);
        logger.info('Add the following to your shell configuration:');
        
        const scriptPath = result.data?.scriptPath;
        if (scriptPath) {
          if (platform.getPlatform() === 'win32') {
            logger.info(`  Add "${scriptPath}" to your PATH`);
          } else {
            logger.info(`  alias pathbunny="source ${scriptPath}"`);
            logger.info(`  alias pb="source ${scriptPath}"`);
            const home = os.homedir();
            const rcFiles = ['.zshrc', '.bashrc'];
            rcFiles.forEach(rc => {
              try {
                const rcPath = path.join(home, rc);
                const line1 = `alias pathbunny=\"source ${scriptPath}\"`;
                const line2 = `alias pb=\"source ${scriptPath}\"`;
                let content = '';
                try { content = fs.readFileSync(rcPath, 'utf8'); } catch {}
                if (!content.includes(line1)) fs.appendFileSync(rcPath, `\n${line1}\n`);
                if (!content.includes(line2)) fs.appendFileSync(rcPath, `\n${line2}\n`);
                logger.success(`Aliases added to ~/${rc}`);
              } catch (e) {
                logger.warning(`Could not update ~/${rc}: ${e}`);
              }
            });
            logger.info('Reload your shell or run: source ~/.zshrc  (or ~/.bashrc)');
          }
        }
      } else {
        logger.error(result.message);
        process.exit(1);
      }
    } catch (error) {
      logger.error(`Setup failed: ${error}`);
      process.exit(1);
    }
  });

// Uninstall command
program
  .command('uninstall')
  .description('remove shell integration and show how to unlink the CLI')
  .action(async () => {
    try {
      const logger = new Logger();
      logger.header('pathbunny Uninstall');

      // 1) Remove ~/.pathbunny directory
      const homeDir = os.homedir();
      const installDir = path.join(homeDir, '.pathbunny');
      if (fs.existsSync(installDir)) {
        try {
          fs.rmSync(installDir, { recursive: true, force: true });
          logger.success(`Removed ${installDir}`);
        } catch (e) {
          logger.warning(`Could not remove ${installDir}: ${e}`);
        }
      } else {
        logger.info('No ~/.pathbunny directory found');
      }

      // 2) Remove aliases from common shell rc files
      const rcFiles = [
        path.join(homeDir, '.zshrc'),
        path.join(homeDir, '.bashrc'),
        path.join(homeDir, '.profile')
      ];

      const aliasPatterns = [
        /alias\s+pathbunny=.*pathbunny\.sh"?\'?/,
        /alias\s+pb=.*pathbunny\.sh"?\'?/
      ];

      rcFiles.forEach(file => {
        try {
          if (!fs.existsSync(file)) return;
          const original = fs.readFileSync(file, 'utf8');
          const lines = original.split(/\r?\n/);
          const filtered = lines.filter(line => !aliasPatterns.some(rx => rx.test(line)));
          if (filtered.length !== lines.length) {
            fs.writeFileSync(file, filtered.join('\n'), 'utf8');
            logger.success(`Cleaned aliases in ${file}`);
          }
        } catch (e) {
          logger.warning(`Could not update ${file}: ${e}`);
        }
      });

      // 3) Attempt to unlink global package (best effort)
      try {
        const cp = require('child_process');
        cp.execSync('npm unlink -g pathbunny', { stdio: 'ignore' });
        logger.success('Unlinked global pathbunny (npm)');
      } catch {
        // ignore
      }

      // 4) Advise shell to refresh hash
      logger.info('If commands still resolve, run: hash -r');
      logger.info('Uninstall completed.');
    } catch (error) {
      logger.error(`Uninstall failed: ${error}`);
      process.exit(1);
    }
  });

// Handle navigation (default behavior)
program
  .argument('[shortcut]', 'shortcut name to navigate to')
  .option('-n, --new-window', 'open in new terminal window')
  .option('-s, --shell <shell>', 'use specific shell')
  .action(async (shortcut: string | undefined, options: any) => {
    // If no shortcut provided and no command matched, show help
    if (!shortcut) {
      program.outputHelp();
      process.exit(0);
    }
    
    const navigateCommand = new NavigateCommand(program.opts().verbose);
    const result = navigateCommand.execute(shortcut, {
      newWindow: options.newWindow,
      shell: options.shell,
      verbose: program.opts().verbose
    });
    
    process.exit(result.success ? 0 : 1);
  });

program.parse();
