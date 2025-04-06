#!/usr/bin/env python3
# activity_tracker.py - main script for tracking github developer activity

import sys
import logging
from datetime import datetime

# import modules
from config import parse_args, setup_logging, load_config, parse_active_devs
from github_client import GitHubClient
from data_collector import collect_developer_data, get_team_members
from notifier import send_discord_notification
from utils import print_summary, save_debug_info

def main():
    """main function - orchestrates the entire process"""
    # parse command line arguments
    args = parse_args()
    
    # setup logging
    logger = setup_logging(args.debug)
    
    # load configuration
    config = load_config(args, logger)
    if not config:
        sys.exit(1)
    
    logger.info(f"checking for developer activity issues in {config['repository']}...")
    logger.info(f"inactivity threshold: {config['inactivity_threshold_days']} days")
    logger.info(f"no issues threshold: {config['no_issues_threshold_days']} days")
    
    try:
        # create github client
        github = GitHubClient(config["github_token"], config["repository"])
        
        # get developers to track
        active_devs = parse_active_devs(config["active_devs_list"])
        
        # if active_devs list is provided, use it, otherwise fetch all contributors/team members/collaborators
        if active_devs:
            all_developers = active_devs
            logger.info(f"using provided list of {len(all_developers)} developers to track")
        else:
            # get all developers to track
            contributors = github.get_contributors()
            team_members = get_team_members(github)
            collaborators = github.get_collaborators()
            
            # combine all developers and remove duplicates
            all_developers = list(set(contributors + team_members + collaborators))
            logger.info(f"found {len(all_developers)} developers to track")
        
        # collect data for all developers
        all_data = []
        for username in all_developers:
            try:
                dev_data = collect_developer_data(github, username, config)
                all_data.append(dev_data)
            except Exception as e:
                logger.error(f"Failed to process developer {username}: {str(e)}")
                # continue with next developer
        
        if not all_data:
            logger.error("No developer data collected. Exiting.")
            return
            
        # print summary of findings
        inactive_count = sum(1 for dev in all_data if dev["is_inactive"])
        no_issues_count = sum(1 for dev in all_data if dev["has_no_issues"])
        
        logger.info(f"found {inactive_count} inactive developers")
        logger.info(f"found {no_issues_count} developers without assigned issues")
        logger.info(f"gathered stats for {len(all_data)} developers")
        
        # print detailed summary if in debug mode
        if config["debug_mode"]:
            print_summary(all_data)
            
            # save debug info
            debug_data = {
                "repository": config["repository"],
                "timestamp": datetime.now().isoformat(),
                "settings": {
                    "inactivity_threshold_days": config["inactivity_threshold_days"],
                    "no_issues_threshold_days": config["no_issues_threshold_days"],
                },
                "api_stats": {
                    "request_count": github.request_count,
                    "rate_limit_remaining": github.rate_limit_remaining,
                    "rate_limit_reset": github.rate_limit_reset,
                },
                "developers": all_data
            }
            save_debug_info(debug_data, config)
        
        # send discord notification
        if not config["dry_run"]:
            try:
                send_discord_notification(all_data, config)
            except Exception as e:
                logger.error(f"Error sending Discord notification: {str(e)}")
        else:
            logger.info("Dry run mode - skipping Discord notification")
    
    except KeyboardInterrupt:
        logger.info("Interrupted by user. Exiting.")
    except Exception as e:
        logger.error(f"An unexpected error occurred: {str(e)}")
        if config["debug_mode"]:
            import traceback
            logger.error(traceback.format_exc())

if __name__ == "__main__":
    main() 