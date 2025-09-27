#!/usr/bin/env bash
set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REPO_URL="https://github.com/gurkanfikretgunak/pathbunny.git"
INSTALL_DIR="$HOME/.pathbunny"
TEMP_DIR="/tmp/pathbunny-install"

echo -e "${BLUE}🐰 PathBunny Installer${NC}"
echo -e "${BLUE}=====================${NC}"
echo

# Check requirements
check_requirements() {
    echo -e "${YELLOW}Checking requirements...${NC}"
    
    if ! command -v node >/dev/null 2>&1; then
        echo -e "${RED}❌ Node.js is required but not installed.${NC}"
        echo -e "${YELLOW}Please install Node.js from https://nodejs.org${NC}"
        exit 1
    fi
    
    if ! command -v npm >/dev/null 2>&1; then
        echo -e "${RED}❌ npm is required but not installed.${NC}"
        exit 1
    fi
    
    if ! command -v git >/dev/null 2>&1; then
        echo -e "${RED}❌ git is required but not installed.${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ All requirements met${NC}"
}

# Install PathBunny
install_pathbunny() {
    echo -e "${YELLOW}Installing PathBunny...${NC}"
    
    # Clean up any existing temp directory
    rm -rf "$TEMP_DIR"
    
    # Clone repository
    echo -e "${BLUE}📦 Cloning repository...${NC}"
    git clone --depth 1 "$REPO_URL" "$TEMP_DIR"
    
    # Install dependencies and build
    cd "$TEMP_DIR"
    echo -e "${BLUE}📦 Installing dependencies...${NC}"
    npm install --silent
    
    echo -e "${BLUE}🔨 Building project...${NC}"
    npm run build
    
    # Create install directory
    mkdir -p "$INSTALL_DIR"
    
    # Copy built files
    cp -r dist "$INSTALL_DIR/"
    cp package.json "$INSTALL_DIR/"
    
    # Create shell script
    cat > "$INSTALL_DIR/pathbunny.sh" << 'EOF'
#!/bin/bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Check if this is likely a navigation command (single argument, no flags)
if [ $# -eq 1 ] && [[ "$1" != -* ]] && [[ "$1" != "add" ]] && [[ "$1" != "list" ]] && [[ "$1" != "ls" ]] && [[ "$1" != "remove" ]] && [[ "$1" != "rm" ]] && [[ "$1" != "update" ]] && [[ "$1" != "export" ]] && [[ "$1" != "info" ]] && [[ "$1" != "setup" ]] && [[ "$1" != "uninstall" ]] && [[ "$1" != "--help" ]] && [[ "$1" != "--version" ]]; then
    # This is likely a navigation command, capture output
    OUTPUT=$(node "$SCRIPT_DIR/dist/index.js" "$@")
    EXIT_CODE=$?
    if [ $EXIT_CODE -eq 0 ] && [[ $OUTPUT == cd* ]]; then
        eval "$OUTPUT"
    else
        echo "$OUTPUT"
    fi
else
    # This is a regular command, run it normally with proper stdin/stdout
    node "$SCRIPT_DIR/dist/index.js" "$@"
fi
EOF
    
    chmod +x "$INSTALL_DIR/pathbunny.sh"
    
    # Clean up
    cd - > /dev/null
    rm -rf "$TEMP_DIR"
    
    echo -e "${GREEN}✅ PathBunny installed to $INSTALL_DIR${NC}"
}

# Setup shell integration
setup_shell() {
    echo -e "${YELLOW}Setting up shell integration...${NC}"
    
    # Detect shell RC file
    SHELL_NAME="$(basename "${SHELL:-zsh}")"
    RC_FILE=""
    case "$SHELL_NAME" in
        zsh) RC_FILE="$HOME/.zshrc" ;;
        bash) RC_FILE="$HOME/.bashrc" ;;
        fish) RC_FILE="$HOME/.config/fish/config.fish" ;;
        *) RC_FILE="$HOME/.profile" ;;
    esac
    
    ALIAS_LINE="alias pathbunny=\"source $INSTALL_DIR/pathbunny.sh\""
    ALIAS_LINE_SHORT="alias pb=\"source $INSTALL_DIR/pathbunny.sh\""
    
    # Create RC file if it doesn't exist
    touch "$RC_FILE"
    
    # Add aliases if not present
    if grep -q "pathbunny=" "$RC_FILE"; then
        echo -e "${YELLOW}⚠️  PathBunny aliases already exist in $RC_FILE${NC}"
    else
        echo "" >> "$RC_FILE"
        echo "# PathBunny aliases" >> "$RC_FILE"
        echo "$ALIAS_LINE" >> "$RC_FILE"
        echo "$ALIAS_LINE_SHORT" >> "$RC_FILE"
        echo -e "${GREEN}✅ Added aliases to $RC_FILE${NC}"
    fi
}

# Main installation
main() {
    check_requirements
    install_pathbunny
    setup_shell
    
    echo
    echo -e "${GREEN}🎉 PathBunny installation complete!${NC}"
    echo
    echo -e "${YELLOW}To start using PathBunny:${NC}"
    echo -e "  1. Reload your shell: ${BLUE}source ~/.zshrc${NC} (or ~/.bashrc)"
    echo -e "  2. Try it out: ${BLUE}pathbunny add demo . && pathbunny demo${NC}"
    echo -e "  3. Get help: ${BLUE}pathbunny --help${NC}"
    echo
    echo -e "${YELLOW}Quick commands:${NC}"
    echo -e "  • ${BLUE}pathbunny add <name> <path>${NC} (or ${BLUE}pb add <name> <path>${NC}) - Add shortcut"
    echo -e "  • ${BLUE}pathbunny <name>${NC} (or ${BLUE}pb <name>${NC}) - Navigate to shortcut"
    echo -e "  • ${BLUE}pathbunny list${NC} (or ${BLUE}pb list${NC}) - List all shortcuts"
    echo -e "  • ${BLUE}pathbunny info${NC} (or ${BLUE}pb info${NC}) - Show system info"
    echo
}

# Run installation
main