#!/bin/bash

echo "🐰 Fixing PathBunny for macOS Terminal..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if pathbunny is installed
if [ ! -d ~/.pathbunny ]; then
    echo -e "${YELLOW}PathBunny not found. Please install first:${NC}"
    echo "curl -fsSL https://raw.githubusercontent.com/gurkanfikretgunak/pathbunny/main/scripts/install.sh | bash"
    exit 1
fi

# Clean up old aliases from all shell configs
echo -e "${BLUE}Cleaning old aliases...${NC}"
for file in ~/.zshrc ~/.bashrc ~/.profile ~/.bash_profile; do
    if [ -f "$file" ]; then
        # Create backup
        cp "$file" "${file}.backup-$(date +%Y%m%d-%H%M%S)" 2>/dev/null || true
        # Remove old aliases
        grep -v "pathbunny\|pb=\|ph=" "$file" > "${file}.temp" && mv "${file}.temp" "$file"
    fi
done

# Add clean aliases to appropriate files
echo -e "${BLUE}Adding clean aliases...${NC}"

# For zsh (macOS default)
cat >> ~/.zshrc << 'EOF'

# PathBunny CLI aliases
alias pathbunny="source ~/.pathbunny/pathbunny.sh"
alias pb="source ~/.pathbunny/pathbunny.sh"
EOF

# For bash compatibility
cat >> ~/.bashrc << 'EOF'

# PathBunny CLI aliases
alias pathbunny="source ~/.pathbunny/pathbunny.sh"
alias pb="source ~/.pathbunny/pathbunny.sh"
EOF

# For general compatibility
cat >> ~/.profile << 'EOF'

# PathBunny CLI aliases
alias pathbunny="source ~/.pathbunny/pathbunny.sh"
alias pb="source ~/.pathbunny/pathbunny.sh"
EOF

echo -e "${GREEN}✅ PathBunny aliases updated!${NC}"
echo ""
echo -e "${YELLOW}To use PathBunny in macOS Terminal:${NC}"
echo -e "1. ${BLUE}Close and reopen Terminal${NC}"
echo -e "2. Or run: ${BLUE}source ~/.zshrc${NC}"
echo -e "3. Test: ${BLUE}pathbunny --version${NC}"
echo ""
echo -e "${YELLOW}Quick test commands:${NC}"
echo -e "• ${BLUE}pathbunny info${NC} - Show system info"
echo -e "• ${BLUE}pb add test .${NC} - Add current directory"
echo -e "• ${BLUE}pb list${NC} - List shortcuts"
