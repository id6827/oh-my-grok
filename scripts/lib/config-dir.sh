#!/usr/bin/env sh

# Priority: GROK_CONFIG_DIR → CLAUDE_CONFIG_DIR → ~/.grok
resolve_claude_config_dir() {
  configured="${GROK_CONFIG_DIR:-${CLAUDE_CONFIG_DIR:-$HOME/.grok}}"
  configured="${configured%/}"
  case "$configured" in
    \~)
      printf '%s\n' "$HOME"
      ;;
    \~/*)
      configured="${configured#\~/}"
      printf '%s/%s\n' "$HOME" "$configured"
      ;;
    *)
      printf '%s\n' "$configured"
      ;;
  esac
}
