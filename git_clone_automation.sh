#!/bin/bash

# Git Clone and Sync Automation Script
# This script automates common Git operations for your projects

# Set text color functions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored text
print_green() {
  echo -e "${GREEN}$1${NC}"
}

print_yellow() {
  echo -e "${YELLOW}$1${NC}"
}

print_blue() {
  echo -e "${BLUE}$1${NC}"
}

print_red() {
  echo -e "${RED}$1${NC}"
}

# Start SSH agent and add key
setup_ssh() {
  print_blue "🔑 Adding SSH key..."
  eval "$(ssh-agent -s)"
  ssh-add ~/.ssh/id_ed25519
  print_green "✅ SSH key added successfully."
}

# Authenticate with GitHub CLI if available
authenticate_github() {
  if command -v gh &> /dev/null; then
    print_blue "🔒 Authenticating with GitHub CLI..."
    gh auth status
    if [ $? -ne 0 ]; then
      gh auth login
    else
      print_green "✅ GitHub authenticated successfully."
    fi
  else
    print_yellow "⚠️  GitHub CLI not found. Some features may be limited."
  fi
}

# Function to get user selection
get_user_selection() {
  local valid_input=false
  local selection
  
  # Display menu options clearly with a header
  echo "========================================"
  print_blue "🔧 Git Operations Menu"
  echo "========================================"
  echo "1) Push local changes to GitHub"
  echo "2) Pull latest changes from GitHub"
  echo "3) Clone a new repository"
  echo "4) List tracked repositories"
  echo "5) Exit"
  echo "========================================"
  
  until $valid_input; do
    read -p "Enter option (1-5): " selection
    
    case $selection in
      1|2|3|4|5)
        valid_input=true
        ;;
      *)
        print_red "Invalid option. Please enter a number between 1 and 5."
        ;;
    esac
  done
  
  echo $selection
}

# Function to push changes
push_changes() {
  print_blue "🚀 Starting push process..."
  echo "----------------------------------------------"
  
  # Get list of tracked repositories
  local repos=()
  if [ -f "$HOME/.git_tracked_repos" ]; then
    while IFS= read -r line; do
      repos+=("$line")
    done < "$HOME/.git_tracked_repos"
  fi
  
  if [ ${#repos[@]} -eq 0 ]; then
    print_yellow "No repositories are being tracked. Use option 3 to add repositories."
    return
  fi
  
  for repo in "${repos[@]}"; do
    local repo_name=$(basename "$repo")
    print_blue "Processing repository: $repo_name"
    
    if [ -d "$repo" ]; then
      cd "$repo"
      
      # Check if there are changes to commit
      if [ -n "$(git status --porcelain)" ]; then
        print_yellow "Changes detected in '$repo_name'."
        read -p "Commit message: " commit_message
        
        git add .
        git commit -m "$commit_message"
        git push
        print_green "✅ Changes pushed to '$repo_name'."
      else
        # Check if there are committed changes that need to be pushed
        local_commit=$(git rev-parse HEAD)
        remote_branch=$(git rev-parse --abbrev-ref --symbolic-full-name @{u} 2>/dev/null)
        
        if [ $? -eq 0 ]; then
          remote_commit=$(git rev-parse $remote_branch 2>/dev/null)
          
          if [ "$local_commit" != "$remote_commit" ]; then
            print_yellow "Unpushed commits detected in '$repo_name'."
            git push
            print_green "✅ Commits pushed to '$repo_name'."
          else
            print_green "✅ No changes to push in '$repo_name'."
          fi
        else
          print_yellow "⚠️  No upstream branch set for '$repo_name'."
          read -p "Do you want to set an upstream branch and push? (y/n): " set_upstream
          
          if [ "$set_upstream" = "y" ]; then
            read -p "Enter remote name (default: origin): " remote_name
            remote_name=${remote_name:-origin}
            read -p "Enter branch name (default: main): " branch_name
            branch_name=${branch_name:-main}
            
            git push --set-upstream $remote_name $branch_name
            print_green "✅ Set upstream and pushed to '$repo_name'."
          fi
        fi
      fi
      
      cd - > /dev/null
    else
      print_red "❌ Directory for '$repo_name' not found."
    fi
    
    echo "----------------------------------------------"
  done
  
  print_green "🎉 Operation completed!"
}

# Function to pull changes
pull_changes() {
  print_blue "📥 Starting pull process..."
  echo "----------------------------------------------"
  
  # Get list of tracked repositories
  local repos=()
  if [ -f "$HOME/.git_tracked_repos" ]; then
    while IFS= read -r line; do
      repos+=("$line")
    done < "$HOME/.git_tracked_repos"
  fi
  
  if [ ${#repos[@]} -eq 0 ]; then
    print_yellow "No repositories are being tracked. Use option 3 to add repositories."
    return
  fi
  
  for repo in "${repos[@]}"; do
    local repo_name=$(basename "$repo")
    print_blue "Processing repository: $repo_name"
    
    if [ -d "$repo" ]; then
      cd "$repo"
      
      # Check if there are uncommitted changes
      if [ -n "$(git status --porcelain)" ]; then
        print_yellow "⚠️  Uncommitted changes detected in '$repo_name'."
        read -p "Do you want to stash these changes before pulling? (y/n): " stash_changes
        
        if [ "$stash_changes" = "y" ]; then
          git stash
          print_green "Changes stashed."
        fi
      fi
      
      print_blue "🔄 Pulling latest changes..."
      git pull
      
      if [ $? -eq 0 ]; then
        print_green "✅ Successfully pulled latest changes for '$repo_name'."
      else
        print_red "❌ Failed to pull changes for '$repo_name'."
      fi
      
      # Pop stashed changes if they were stashed
      if [ "$stash_changes" = "y" ]; then
        git stash pop
        print_green "Stashed changes reapplied."
      fi
      
      cd - > /dev/null
    else
      print_red "❌ Directory for '$repo_name' not found."
    fi
    
    echo "----------------------------------------------"
  done
  
  print_green "🎉 Operation completed!"
}

# Function to clone a new repository
clone_repository() {
  print_blue "🔍 Cloning a new repository..."
  
  read -p "Enter GitHub repository URL: " repo_url
  read -p "Enter destination directory (leave blank for default): " dest_dir
  
  # Extract repo name from URL
  repo_name=$(basename -s .git "$repo_url")
  
  if [ -z "$dest_dir" ]; then
    dest_dir="$HOME/$repo_name"
  fi
  
  # Clone the repository
  print_blue "Cloning $repo_url to $dest_dir..."
  git clone "$repo_url" "$dest_dir"
  
  if [ $? -eq 0 ]; then
    print_green "✅ Repository cloned successfully."
    
    # Add to tracked repositories
    if [ ! -f "$HOME/.git_tracked_repos" ] || ! grep -q "^$dest_dir$" "$HOME/.git_tracked_repos"; then
      echo "$dest_dir" >> "$HOME/.git_tracked_repos"
      print_green "✅ Added to tracked repositories."
    fi
  else
    print_red "❌ Failed to clone repository."
    return
  fi
  
  print_green "🎉 Operation completed!"
}

# Function to list tracked repositories
list_repositories() {
  print_blue "📋 Tracked repositories:"
  echo "----------------------------------------------"
  
  if [ -f "$HOME/.git_tracked_repos" ]; then
    local count=0
    while IFS= read -r repo; do
      local repo_name=$(basename "$repo")
      
      if [ -d "$repo" ]; then
        cd "$repo"
        branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)
        latest_commit=$(git log -1 --format="%h - %s (%ar)" 2>/dev/null)
        
        if [ -n "$branch" ] && [ -n "$latest_commit" ]; then
          count=$((count+1))
          echo "$count) $repo_name"
          echo "   Path: $repo"
          echo "   Branch: $branch"
          echo "   Latest commit: $latest_commit"
          echo "----------------------------------------------"
        else
          print_yellow "⚠️  $repo_name is not a valid Git repository."
        fi
        
        cd - > /dev/null
      else
        print_red "❌ Directory for '$repo_name' not found."
      fi
    done < "$HOME/.git_tracked_repos"
    
    if [ $count -eq 0 ]; then
      print_yellow "No valid tracked repositories found."
    fi
  else
    print_yellow "No repositories are being tracked yet."
  fi
}

# Main function
main() {
  # Setup SSH and authenticate with GitHub
  setup_ssh
  authenticate_github
  
  # Get user selection
  selection=$(get_user_selection)
  
  # Process user selection
  case $selection in
    1)
      push_changes
      ;;
    2)
      pull_changes
      ;;
    3)
      clone_repository
      ;;
    4)
      list_repositories
      ;;
    5)
      print_blue "Exiting script. Goodbye! 👋"
      exit 0
      ;;
  esac
}

# Run the main function
main
