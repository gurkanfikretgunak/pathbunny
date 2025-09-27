# pathbunny 🐰

> Lightning-fast directory shortcuts for your terminal

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

Jump to any directory instantly with memorable shortcuts. No more typing long paths!

## ⚡ Quick Install

**macOS/Linux (One-line install):**
```bash
curl -fsSL https://raw.githubusercontent.com/gurkanfikretgunak/pathbunny/main/scripts/install.sh | bash
```

**Or install manually:**
```bash
git clone https://github.com/gurkanfikretgunak/pathbunny.git && cd pathbunny && npm install && npm run build && npm link && pathbunny setup
```

## 🐰 Quick Start

```bash
# Add shortcuts
pathbunny add github ~/Documents/GitHub    # or: pb add github ~/Documents/GitHub
pathbunny add projects ~/Projects          # or: pb add projects ~/Projects

# Navigate instantly  
pathbunny github    # or: pb github
pathbunny projects  # or: pb projects

# List shortcuts
pathbunny list      # or: pb list
```

## 📖 Commands

| Command | Description | Example |
|---------|-------------|---------|
| `pathbunny add <name> <path>` | Create shortcut | `pathbunny add work ~/Work` or `pb add work ~/Work` |
| `pathbunny <name>` | Navigate to shortcut | `pathbunny work` or `pb work` |
| `pathbunny list` | Show all shortcuts | `pathbunny list` or `pb list` |
| `pathbunny remove <name>` | Delete shortcut | `pathbunny remove work` or `pb remove work` |
| `pathbunny info` | Show system info | `pathbunny info` or `pb info` |

## 🔧 Options

- **Add with description**: `pathbunny add docs ~/Documents -d "My documents"` or `pb add docs ~/Documents -d "My documents"`
- **Force overwrite**: `pathbunny add work ~/NewWork --force` or `pb add work ~/NewWork --force`
- **Remove without confirmation**: `pathbunny remove work --force` or `pb remove work --force`
- **Different output formats**: `pathbunny list --format json` or `pb list --format json`

## 💡 Pro Tips

```bash
# Quick shortcuts for common dirs
pathbunny add home ~           # or: pb add home ~
pathbunny add downloads ~/Downloads    # or: pb add downloads ~/Downloads
pathbunny add desktop ~/Desktop        # or: pb add desktop ~/Desktop

# Navigate and open in new terminal
pathbunny work --new-window    # or: pb work --new-window

# Update existing shortcut
pathbunny update work ~/NewWorkPath    # or: pb update work ~/NewWorkPath
```

## 🆘 Need Help?

```bash
pathbunny --help       # General help        (or: pb --help)
pathbunny add --help   # Command-specific help (or: pb add --help)
pathbunny info         # System information  (or: pb info)
```

## 🐛 Issues or Questions?

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/gurkanfikretgunak/pathbunny/issues)
- 💡 **Feature Ideas**: [GitHub Discussions](https://github.com/gurkanfikretgunak/pathbunny/discussions)

## 🤝 Contributing

1. Fork the repo
2. Create your feature branch: `git checkout -b my-feature`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin my-feature`
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file

---

<div align="center">
  <strong>Made with ❤️ by <a href="https://github.com/gurkanfikretgunak">Gurkan Fikret Gunak</a></strong>
</div>