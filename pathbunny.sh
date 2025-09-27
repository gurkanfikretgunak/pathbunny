#!/bin/bash

# pathbunny Shell Integration Script
# This script enables directory navigation by executing the cd command
# in the current shell context.

# Resolve script directory for bash/zsh/sh
_SELF="${BASH_SOURCE[0]:-$0}"
SCRIPT_DIR="$(cd "$(dirname "$_SELF")" && pwd)"

# Execute pathbunny and capture output (mark as sourced)
export PATHBUNNY_SOURCED=1

# Prefer globally installed pathbunny if available
if command -v pathbunny >/dev/null 2>&1; then
  OUTPUT=$(PATHBUNNY_SOURCED=1 pathbunny "$@" 2>/dev/null)
  EXIT_CODE=$?
elif [ -f "$SCRIPT_DIR/dist/index.js" ]; then
  OUTPUT=$(node "$SCRIPT_DIR/dist/index.js" "$@" 2>/dev/null)
  EXIT_CODE=$?
else
  echo "pathbunny is not installed. Install with: npm i -g pathbunny" >&2
  exit 1
fi

# If the command was successful and output starts with "cd", execute it
if [ $EXIT_CODE -eq 0 ] && [[ $OUTPUT == cd* ]]; then
    eval "$OUTPUT"
else
    # For non-navigation commands, just show the output
    if [ -n "$OUTPUT" ]; then
        echo "$OUTPUT"
    fi
    exit $EXIT_CODE
fi

