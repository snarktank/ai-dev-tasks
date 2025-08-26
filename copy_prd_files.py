#!/usr/bin/env python3
"""
Script to copy workspace files to a specified destination directory.
Usage: python copy_files.py <destination_directory>
"""

import os
import shutil
import sys
from pathlib import Path


def copy_workspace_files(destination_dir):
    """
    Copy workspace files to the specified destination directory.
    
    Args:
        destination_dir (str): Path to the destination directory
    """
    # Get the current workspace directory
    workspace_dir = Path(__file__).parent.absolute()
    
    # Files to copy with their corresponding directory names
    files_to_copy = [
        ("create-prd.md", "create-prd"),
        ("generate-tasks.md", "generate-tasks"),
        ("process-task-list.md", "process-task-list")
    ]
    
    # Create destination directory if it doesn't exist
    dest_path = Path(destination_dir)
    dest_path.mkdir(parents=True, exist_ok=True)
    
    print(f"Copying files from {workspace_dir} to {dest_path}")
    
    copied_count = 0
    for filename, dirname in files_to_copy:
        source_file = workspace_dir / filename
        
        # Create subdirectory for this file
        subdir_path = dest_path / dirname
        subdir_path.mkdir(exist_ok=True)
        
        dest_file = subdir_path / filename
        
        if source_file.exists():
            try:
                shutil.copy2(source_file, dest_file)
                print(f"✓ Copied: {filename} to {dirname}/")
                copied_count += 1
            except Exception as e:
                print(f"✗ Error copying {filename}: {e}")
        else:
            print(f"⚠ Warning: {filename} not found in workspace")
    
    print(f"\nCopy operation complete! {copied_count} files copied to {dest_path}")


def main():
    """Main function to handle command line arguments and execute the copy operation."""
    if len(sys.argv) != 2:
        print("Usage: python copy_files.py <destination_directory>")
        print("Example: python copy_files.py /path/to/destination")
        sys.exit(1)
    
    destination = sys.argv[1]
    
    # Validate destination path
    if os.path.exists(destination) and not os.path.isdir(destination):
        print(f"Error: '{destination}' exists but is not a directory")
        sys.exit(1)
    
    # Ask for user confirmation
    print(f"\nAbout to copy files to: {destination}")
    print("This will create the following structure:")
    print("  - create-prd/create-prd.md")
    print("  - generate-tasks/generate-tasks.md")
    print("  - process-task-list/process-task-list.md")
    
    while True:
        confirm = input("\nDo you want to proceed? (y/n): ").strip().lower()
        if confirm in ['y', 'yes']:
            break
        elif confirm in ['n', 'no']:
            print("Operation cancelled.")
            sys.exit(0)
        else:
            print("Please enter 'y' or 'n'.")
    
    try:
        copy_workspace_files(destination)
    except KeyboardInterrupt:
        print("\nOperation cancelled by user")
        sys.exit(1)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
