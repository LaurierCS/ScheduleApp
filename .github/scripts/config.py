#!/usr/bin/env python3

import os
import logging
import argparse
from dotenv import load_dotenv

# load environment variables
load_dotenv()

def parse_args():
    """parse command line arguments"""
    parser = argparse.ArgumentParser(description="GitHub activity tracker")
    parser.add_argument("--debug", action="store_true", help="enable debug logging")
    parser.add_argument("--dry-run", action="store_true", help="don't send discord notifications")
    return parser.parse_args()

def setup_logging(debug_mode=False):
    """configure logging based on settings"""
    log_level = logging.DEBUG if debug_mode else logging.INFO
    logging.basicConfig(
        level=log_level,
        format="%(asctime)s - %(levelname)s - %(message)s",
        handlers=[logging.StreamHandler()]
    )
    return logging.getLogger("activity_tracker")

def load_config(args, logger):
    """load configuration from environment variables"""
    config = {
        # api authentication
        "github_token": os.environ.get("GH_TOKEN"),
        "discord_webhook_url": os.environ.get("DISCORD_WEBHOOK_URL"),
        
        # repository settings
        "repository": os.environ.get("GH_REPOSITORY"),
        
        # thresholds
        "inactivity_threshold_days": int(os.environ.get("INACTIVITY_THRESHOLD_DAYS", 7)),
        "no_issues_threshold_days": int(os.environ.get("NO_ISSUES_THRESHOLD_DAYS", 3)),
        
        # developer list
        "active_devs_list": os.environ.get("ACTIVE_DEVS", ""),
        
        # runtime settings
        "debug_mode": args.debug,
        "dry_run": args.dry_run
    }
    
    # validate required settings
    if not config["github_token"]:
        logger.error("Error: GH_TOKEN not set")
        return None
        
    if not config["discord_webhook_url"] and not config["dry_run"]:
        logger.error("Error: DISCORD_WEBHOOK_URL not set and not in dry-run mode")
        return None
        
    if not config["repository"]:
        logger.error("Error: GH_REPOSITORY not set")
        return None
    
    return config

def parse_active_devs(active_devs_list):
    """parse active developers list from environment variable"""
    if not active_devs_list:
        return []
    
    # remove whitespace and filter out empty strings
    devs = [dev.strip() for dev in active_devs_list.split(",")]
    return [dev for dev in devs if dev] 