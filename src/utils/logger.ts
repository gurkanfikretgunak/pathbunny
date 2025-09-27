import chalk from 'chalk';

export class Logger {
  private verbose: boolean;

  constructor(verbose: boolean = false) {
    this.verbose = verbose;
  }

  public info(message: string): void {
    console.log(chalk.blue('ℹ'), message);
  }

  public success(message: string): void {
    console.log(chalk.green('✓'), message);
  }

  public warning(message: string): void {
    console.log(chalk.yellow('⚠'), message);
  }

  public error(message: string): void {
    console.error(chalk.red('✗'), message);
  }

  public debug(message: string): void {
    if (this.verbose) {
      console.log(chalk.gray('🔍'), chalk.gray(message));
    }
  }

  public table(data: any[]): void {
    console.table(data);
  }

  public json(data: any): void {
    console.log(JSON.stringify(data, null, 2));
  }

  public list(items: string[], bullet: string = '•'): void {
    items.forEach(item => {
      console.log(`  ${chalk.cyan(bullet)} ${item}`);
    });
  }

  public header(title: string): void {
    console.log();
    console.log(chalk.bold.cyan(`━━━ ${title} ━━━`));
    console.log();
  }

  public separator(): void {
    console.log(chalk.gray('─'.repeat(50)));
  }
}
