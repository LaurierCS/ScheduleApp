#!/usr/bin/env python3

import logging
import json
from datetime import datetime

logger = logging.getLogger("activity_tracker")

def format_date_display(date_str):
    """format date string for display"""
    if not date_str:
        return "unknown"
    
    try:    
        date_time = datetime.strptime(date_str, "%Y-%m-%dT%H:%M:%SZ")
        days_ago = (datetime.now() - date_time).days
        
        if days_ago == 0:
            return "today"
        elif days_ago == 1:
            return "yesterday"
        else:
            return f"{days_ago} days ago"
    except Exception as e:
        logger.error(f"Error formatting date {date_str}: {str(e)}")
        return "unknown date format"

def save_debug_info(debug_data, config):
    """save detailed debug information to a file"""
    if not config["debug_mode"]:
        return
    
    debug_file = f"activity_tracker_debug_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    
    try:
        with open(debug_file, "w") as f:
            json.dump(debug_data, f, indent=2)
        logger.info(f"Debug information saved to {debug_file}")
    except Exception as e:
        logger.error(f"Failed to save debug info: {str(e)}")

def print_summary(all_data):
    """print a summary of all developer data for debugging"""
    if not all_data:
        logger.info("No developers to summarize")
        return
    
    # print a header
    logger.info("\n----- DEVELOPER ACTIVITY SUMMARY -----")
    logger.info(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    logger.info(f"Total developers tracked: {len(all_data)}")
    logger.info("-------------------------------------\n")
    
    # print a summary for each developer
    for dev in all_data:
        username = dev["username"]
        stats = dev["stats"]
        
        logger.info(f"Developer: {username}")
        logger.info(f"  PRs Created: {stats['prs_created']}")
        logger.info(f"  PRs Merged: {stats['prs_merged']}")
        logger.info(f"  Issues Assigned: {stats['issues_assigned']}")
        logger.info(f"  Comments: {stats['comments']}")
        logger.info(f"  Last Active: {stats['last_activity_display']} ({stats['last_activity_type'] if stats['last_activity_type'] else 'unknown'})")
        
        if dev["is_inactive"]:
            logger.info(f"  Status: INACTIVE - {dev['inactivity_reason']}")
        elif dev["has_no_issues"]:
            logger.info("  Status: NO ISSUES ASSIGNED")
        else:
            logger.info("  Status: ACTIVE")
        
        logger.info("-------------------------------------") 