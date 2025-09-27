import * as os from 'os';
import * as path from 'path';
import { exec, spawn } from 'child_process';
import { Platform, PlatformConfig, CommandResult } from '../types';

export class PlatformManager {
  private platform: Platform;
  private config: PlatformConfig;

  constructor() {
    this.platform = os.platform() as Platform;
    this.config = this.getPlatformConfig();
  }

  private getPlatformConfig(): PlatformConfig {
    switch (this.platform) {
      case 'darwin': // macOS
        return {
          shell: process.env.SHELL || '/bin/zsh',
          cdCommand: 'cd',
          pathSeparator: '/',
          homeDir: os.homedir()
        };
      
      case 'linux':
        return {
          shell: process.env.SHELL || '/bin/bash',
          cdCommand: 'cd',
          pathSeparator: '/',
          homeDir: os.homedir()
        };
      
      case 'win32': // Windows
        return {
          shell: process.env.COMSPEC || 'cmd.exe',
          cdCommand: 'cd /d',
          pathSeparator: '\\',
          homeDir: os.homedir()
        };
      
      default:
        // Fallback to Unix-like defaults
        return {
          shell: '/bin/bash',
          cdCommand: 'cd',
          pathSeparator: '/',
          homeDir: os.homedir()
        };
    }
  }

  public navigateToPath(targetPath: string, options: { newWindow?: boolean; shell?: string } = {}): CommandResult {
    const { newWindow = false, shell } = options;
    const useShell = shell || this.config.shell;

    try {
      if (newWindow) {
        return this.openNewTerminalWindow(targetPath, useShell);
      }

      const isSourced = process.env.PATHBUNNY_SOURCED === '1';
      if (isSourced) {
        // Shell integration active → return cd command for wrapper
        return this.navigateInCurrentShell(targetPath);
      }

      // Zero-config fallback → open an interactive subshell in the target directory
      return this.openSubshellInPath(targetPath, useShell);
    } catch (error) {
      return {
        success: false,
        message: `Failed to navigate to ${targetPath}: ${error}`
      };
    }
  }

  private navigateInCurrentShell(targetPath: string): CommandResult {
    // For current shell navigation, we need to output the cd command
    // so the parent shell can execute it
    const cdCommand = `${this.config.cdCommand} "${targetPath}"`;
    
    // Output the command that the shell script wrapper will execute
    console.log(cdCommand);
    
    return {
      success: true,
      message: `Navigated to ${targetPath}`,
      data: { command: cdCommand, path: targetPath }
    };
  }

  private openNewTerminalWindow(targetPath: string, shell: string): CommandResult {
    let command: string;
    let args: string[];

    switch (this.platform) {
      case 'darwin': // macOS
        if (shell.includes('zsh') || shell.includes('bash')) {
          command = 'osascript';
          args = [
            '-e',
            `tell application "Terminal" to do script "cd '${targetPath}'"`
          ];
        } else {
          command = 'open';
          args = ['-a', 'Terminal', targetPath];
        }
        break;

      case 'linux':
        // Try common terminal emulators
        const terminals = ['gnome-terminal', 'konsole', 'xterm', 'terminator'];
        const availableTerminal = terminals.find(term => {
          try {
            exec(`which ${term}`);
            return true;
          } catch {
            return false;
          }
        });

        if (availableTerminal) {
          command = availableTerminal;
          args = ['--working-directory', targetPath];
        } else {
          throw new Error('No suitable terminal emulator found');
        }
        break;

      case 'win32': // Windows
        command = 'start';
        args = ['cmd', '/k', `cd /d "${targetPath}"`];
        break;

      default:
        throw new Error(`Unsupported platform: ${this.platform}`);
    }

    return new Promise<CommandResult>((resolve) => {
      const child = spawn(command, args, { detached: true, stdio: 'ignore' });
      
      child.on('error', (error) => {
        resolve({
          success: false,
          message: `Failed to open new terminal: ${error.message}`
        });
      });

      child.on('spawn', () => {
        child.unref(); // Allow the parent process to exit
        resolve({
          success: true,
          message: `Opened new terminal window at ${targetPath}`
        });
      });
    }) as any; // Type assertion for synchronous usage
  }

  private openSubshellInPath(targetPath: string, shell: string): CommandResult {
    try {
      const spawn = require('child_process').spawn;

      if (this.platform === 'win32') {
        const child = spawn('cmd.exe', ['/k'], {
          cwd: targetPath,
          stdio: 'inherit',
        });
        // Do not force-exit parent; let child control the session
        child.on('error', () => {});
        return { success: true, message: `Opened subshell at ${targetPath}` };
      }

      const userShell = shell || this.config.shell;
      const shellName = userShell.split('/').pop() || '';
      const interactiveArg = shellName.includes('zsh') || shellName.includes('bash') ? ['-i'] : [];
      const child = spawn(userShell, interactiveArg, { cwd: targetPath, stdio: 'inherit' });
      // Avoid calling process.exit here to prevent TTY errors in some terminals
      child.on('error', () => {});
      return { success: true, message: `Opened subshell at ${targetPath}` };
    } catch (error: any) {
      return {
        success: false,
        message: `Failed to open subshell: ${error?.message || error}`,
      };
    }
  }

  public resolvePath(inputPath: string): string {
    if (inputPath === '.') {
      return process.cwd();
    }
    
    if (inputPath === '~') {
      return this.config.homeDir;
    }
    
    if (inputPath.startsWith('~/')) {
      return path.join(this.config.homeDir, inputPath.slice(2));
    }
    
    return path.resolve(inputPath);
  }

  public getPlatform(): Platform {
    return this.platform;
  }

  public getConfig(): PlatformConfig {
    return { ...this.config };
  }

  public createShellScript(): CommandResult {
    const scriptContent = this.getShellScriptContent();
    const scriptPath = this.getShellScriptPath();

    try {
      const fs = require('fs');
      const dir = require('path').dirname(scriptPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(scriptPath, scriptContent, { mode: 0o755 });
      
      return {
        success: true,
        message: `Shell script created at ${scriptPath}`,
        data: { scriptPath, content: scriptContent }
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to create shell script: ${error}`
      };
    }
  }

  private getShellScriptContent(): string {
    switch (this.platform) {
      case 'win32':
        return `@echo off
node "%~dp0dist\\index.js" %*
if %errorlevel% equ 0 (
    for /f "delims=" %%i in ('node "%~dp0dist\\index.js" %*') do (
        if "%%i" neq "" (
            %%i
        )
    )
)`;

      default: // Unix-like systems
        return `#!/bin/bash
SCRIPT_DIR="$(cd "$(dirname "\${BASH_SOURCE[0]}")" && pwd)"
OUTPUT=$(node "$SCRIPT_DIR/dist/index.js" "$@")
EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ] && [[ $OUTPUT == cd* ]]; then
    eval "$OUTPUT"
else
    echo "$OUTPUT"
fi`;
    }
  }

  private getShellScriptPath(): string {
    const scriptName = this.platform === 'win32' ? 'pathbunny.bat' : 'pathbunny.sh';
    if (this.platform === 'win32') {
      return path.join(process.cwd(), scriptName);
    }
    return path.join(os.homedir(), '.pathbunny', scriptName);
  }
}
