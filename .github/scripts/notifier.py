#!/usr/bin/env python3

import requests
import logging
from datetime import datetime

logger = logging.getLogger("activity_tracker")

def send_discord_notification(all_data, config):
    """send notification to discord with the results"""
    if not all_data:
        logger.info("no developers to notify")
        return
    
    # skip if in dry-run mode
    if config["dry_run"]:
        logger.info("dry run mode - skipping discord notification")
        return
        
    # get webhook url from config
    discord_webhook_url = config["discord_webhook_url"]
    repository = config["repository"]
    
    # extract lists for different types of developers
    inactive_devs = [
        {"username": dev["username"], "last_active": dev["stats"]["last_activity_display"], "reason": dev["inactivity_reason"]}
        for dev in all_data if dev["is_inactive"]
    ]
    
    no_issues_devs = [
        {"username": dev["username"], "last_assigned": dev["stats"]["last_activity_display"]}
        for dev in all_data if dev["has_no_issues"]
    ]
    
    dev_stats = [
        {
            "username": dev["username"],
            "prs_created": dev["stats"]["prs_created"],
            "prs_merged": dev["stats"]["prs_merged"],
            "issues_assigned": dev["stats"]["issues_assigned"],
            "comments": dev["stats"]["comments"],
            "last_activity_display": dev["stats"]["last_activity_display"]
        }
        for dev in all_data
    ]
    
    has_inactive = len(inactive_devs) > 0
    has_no_issues = len(no_issues_devs) > 0
    has_dev_stats = len(dev_stats) > 0
    
    if not has_inactive and not has_no_issues and not has_dev_stats:
        logger.info("no developers to notify")
        return
    
    # get repo name for prettier display
    repo_name = repository.split("/")[1] if "/" in repository else repository
    
    # create an embed for the main message
    embeds = [
        {
            "title": "🔔 activity report",
            "description": f"report for the **{repo_name}** repo",
            "color": 3447003,  # blue color
            "timestamp": datetime.now().isoformat(),
            "footer": {
                "text": f"{repository}"
            }
        }
    ]
    
    # add section for developer activity summary
    if has_dev_stats:
        # sort developers by total activity (sum of all metrics)
        sorted_devs = sorted(
            dev_stats, 
            key=lambda x: (x['prs_created'] + x['prs_merged'] + x['comments']),
            reverse=True
        )
        
        activity_embed = {
            "title": "📊 developer activity summary",
            "description": f"activity in the past 30 days:",
            "color": 3066993,  # green color
            "fields": []
        }
        
        for dev in sorted_devs:
            username = dev['username']
            
            # create emojis based on activity levels
            pr_emoji = "🔥" if dev['prs_created'] > 3 else "✅" if dev['prs_created'] > 0 else "⬜"
            merged_emoji = "🔥" if dev['prs_merged'] > 3 else "✅" if dev['prs_merged'] > 0 else "⬜"
            issues_emoji = "🔥" if dev['issues_assigned'] > 2 else "✅" if dev['issues_assigned'] > 0 else "⬜"
            comments_emoji = "🔥" if dev['comments'] > 5 else "✅" if dev['comments'] > 0 else "⬜"
            
            # create a summary of their activity
            activity_summary = (
                f"{pr_emoji} **{dev['prs_created']}** PRs created\n"
                f"{merged_emoji} **{dev['prs_merged']}** PRs merged\n"
                f"{issues_emoji} **{dev['issues_assigned']}** current issues\n"
                f"{comments_emoji} **{dev['comments']}** comments\n\n"
                f"Last active: **{dev['last_activity_display']}**"
            )
            
            activity_embed["fields"].append({
                "name": f"👤 @{username}",
                "value": activity_summary,
                "inline": True
            })
        
        embeds.append(activity_embed)
    
    # add section for inactive developers
    if has_inactive:
        inactive_embed = {
            "title": "💤 inactive developers",
            "description": f"these developers have had no activity in the past **{config['inactivity_threshold_days']} days**.",
            "color": 15105570,  # warning color (orange)
            "fields": []
        }
        
        for dev in inactive_devs:
            username = dev['username']
            reason = dev.get('reason', 'unknown reason')
            inactive_embed["fields"].append({
                "name": f"👤 @{username}",
                "value": f"last active: {dev.get('last_active', 'unknown')}\nreason: {reason}",
                "inline": False
            })
        
        embeds.append(inactive_embed)
    
    # add section for no issues developers
    if has_no_issues:
        no_issues_embed = {
            "title": "📝 developers without assigned issues",
            "description": f"these developers have not had issues assigned for **{config['no_issues_threshold_days']}+ days**.",
            "color": 15844367,  # gold color
            "fields": []
        }
        
        for dev in no_issues_devs:
            username = dev['username']
            no_issues_embed["fields"].append({
                "name": f"👤 @{username}",
                "value": f"last assigned: {dev.get('last_assigned', 'unknown')}",
                "inline": False
            })
        
        embeds.append(no_issues_embed)
    
    # add recommendations section
    recs_embed = {
        "title": "💡 recommendations",
        "color": 3066993,  # green color
        "fields": [
            {
                "name": "for inactive developers",
                "value": "- provide status updates on discord\n- create and review pull requests",
                "inline": False
            },
            {
                "name": "for developers without issues",
                "value": "- pick up new issues from the backlog\n- help review open prs",
                "inline": False
            }
        ]
    }
    
    embeds.append(recs_embed)
    
    # create the webhook payload
    payload = {
        "embeds": embeds
    }
    
    # send the webhook
    try:
        response = requests.post(discord_webhook_url, json=payload)
        
        if response.status_code not in [200, 204]:
            logger.error(f"error sending discord notification: {response.status_code}")
            logger.error(response.text)
        else:
            logger.info(f"successfully sent discord notification")
            if has_inactive:
                logger.info(f"- {len(inactive_devs)} inactive developers")
            if has_no_issues:
                logger.info(f"- {len(no_issues_devs)} developers without assigned issues")
            if has_dev_stats:
                logger.info(f"- included activity summary for {len(dev_stats)} developers")
    except Exception as e:
        logger.error(f"error sending discord notification: {str(e)}") 