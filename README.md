# pathbunny 🚀

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

## 🚀 Quick Start

```bash
# Add shortcuts
pathbunny add github ~/Documents/GitHub
pathbunny add projects ~/Projects

# Navigate instantly  
pathbunny github    # or: pb github
pathbunny projects  # or: pb projects

# List shortcuts
pathbunny list
```

## 📖 Commands

| Command | Description | Example |
|---------|-------------|---------|
| `pb add <name> <path>` | Create shortcut | `pb add work ~/Work` |
| `pb <name>` | Navigate to shortcut | `pb work` |
| `pb list` | Show all shortcuts | `pb list` |
| `pb remove <name>` | Delete shortcut | `pb remove work` |
| `pb info` | Show system info | `pb info` |

## 🔧 Options

- **Add with description**: `pb add docs ~/Documents -d "My documents"`
- **Force overwrite**: `pb add work ~/NewWork --force`
- **Remove without confirmation**: `pb remove work --force`
- **Different output formats**: `pb list --format json`

## 💡 Pro Tips

```bash
# Quick shortcuts for common dirs
pb add home ~
pb add downloads ~/Downloads
pb add desktop ~/Desktop

# Navigate and open in new terminal
pb work --new-window

# Update existing shortcut
pb update work ~/NewWorkPath
```

## 🆘 Need Help?

```bash
pb --help              # General help
pb add --help          # Command-specific help
pb info               # System information
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