#!/usr/bin/env python3

import logging
from datetime import datetime, timedelta
from utils import format_date_display

logger = logging.getLogger("activity_tracker")

def collect_developer_data(github, username, config):
    """collect all data for a single developer in one operation to avoid duplicate api calls"""
    logger.info(f"collecting data for {username}...")
    
    try:
        # define cutoff dates
        inactivity_threshold_days = config["inactivity_threshold_days"]
        no_issues_threshold_days = config["no_issues_threshold_days"]
        
        inactivity_cutoff = datetime.now() - timedelta(days=inactivity_threshold_days)
        inactivity_cutoff_str = inactivity_cutoff.strftime("%Y-%m-%dT%H:%M:%SZ")
        
        no_issues_cutoff = datetime.now() - timedelta(days=no_issues_threshold_days)
        no_issues_cutoff_str = no_issues_cutoff.strftime("%Y-%m-%dT%H:%M:%SZ")
        
        stats_cutoff = datetime.now() - timedelta(days=30)  # 30 days for general stats
        stats_cutoff_str = stats_cutoff.strftime("%Y-%m-%dT%H:%M:%SZ")
        
        # get assigned issues
        assigned_issues = github.get_assigned_issues(username)
        has_assigned_issues = len(assigned_issues) > 0
        
        # check for recent activity
        has_recent_activity, activity_type = check_recent_activity(github, username, inactivity_cutoff_str)
        
        # get prs created
        prs, _ = github.get_user_prs(username, stats_cutoff_str)
        
        # verify each pr is by this user
        verified_prs = []
        for pr in prs:
            if pr is None:
                continue
                
            pr_author = pr.get("user", {}).get("login")
            if pr_author == username:
                verified_prs.append(pr)
            else:
                logger.warning(f"PR filtered - not by {username} (author: {pr_author})")
        
        prs = verified_prs
        
        # get merged pr count
        _, merged_prs_count = github.get_user_prs(username, stats_cutoff_str, merged_only=True)
        
        # get comments
        comments = github.get_user_comments(username, stats_cutoff_str)
        
        # get all open prs for this user
        open_prs = github.get_user_open_prs(username)
        
        # filter to make sure these are actually the user's prs
        filtered_open_prs = []
        for pr in open_prs:
            pr_author = pr.get("user", {}).get("login")
            if pr_author == username:
                filtered_open_prs.append(pr)
            else:
                logger.warning(f"PR #{pr.get('number')} has creator={username} in API filter but user.login={pr_author}")
        
        open_prs = filtered_open_prs
        
        # find the most recent activity
        last_activity_date = None
        last_activity_type = None
        
        # check prs for last activity
        if prs and len(prs) > 0:
            pr = prs[0]
            if pr and isinstance(pr, dict):
                pr_date = pr.get("updated_at")
                if pr_date:
                    last_activity_date = pr_date
                    last_activity_type = "PR"
        
        # check open prs for last activity
        if open_prs:
            for pr in open_prs:
                if pr and isinstance(pr, dict):
                    pr_date = pr.get("updated_at")
                    if pr_date and (not last_activity_date or pr_date > last_activity_date):
                        last_activity_date = pr_date
                        last_activity_type = "PR"
        
        # check comments for last activity
        if comments and len(comments) > 0:
            comment = comments[0]
            if comment and isinstance(comment, dict):
                comment_date = comment.get("updated_at")
                if comment_date and (not last_activity_date or comment_date > last_activity_date):
                    last_activity_date = comment_date
                    last_activity_type = "comment"
        
        # determine if inactive based on our criteria
        is_inactive = False
        inactivity_reason = None
        
        if not has_recent_activity:
            if has_assigned_issues:
                # check if active since assignment + grace period for any assigned issue
                active_since_assignment = False
                for issue in assigned_issues:
                    issue_number = issue.get("number")
                    if not issue_number:
                        continue
                    assignment_date = github.get_issue_assignment_date(issue_number, username)
                    if check_activity_since_assignment(github, username, assignment_date, inactivity_threshold_days):
                        active_since_assignment = True
                        break
                        
                is_inactive = not active_since_assignment
                if is_inactive:
                    inactivity_reason = "no activity since issue assignment"
            else:
                # no assigned issues and no recent activity
                is_inactive = True
                inactivity_reason = "no recent activity and no assigned issues"
        
        # check if user has no issues and further analyze inactivity reasons
        has_no_issues = False
        last_assigned_date = None
        if not has_assigned_issues:
            last_assigned_date = github.get_last_assigned_date(username)
            if not last_assigned_date or datetime.strptime(last_assigned_date, "%Y-%m-%dT%H:%M:%SZ") <= no_issues_cutoff:
                has_no_issues = True
        
        # format the last activity date for display
        last_activity_display = "never"
        if last_activity_date:
            last_activity_display = format_date_display(last_activity_date)
        
        # more detailed inactivity reasons
        if is_inactive and not inactivity_reason:
            if len(prs) == 0 and not open_prs:
                inactivity_reason = "no pull requests created recently"
            elif merged_prs_count == 0:
                inactivity_reason = "no pull requests merged recently"
            elif len(comments) == 0:
                inactivity_reason = "no comments on issues/prs recently"
            else:
                inactivity_reason = f"no activity in the past {inactivity_threshold_days} days"
        
        # add debugging info
        activity_details = {
            "prs_count": len(prs),
            "open_prs_count": len(open_prs),
            "comments_count": len(comments),
            "issues_count": len(assigned_issues),
        }
        logger.debug(f"Activity summary for {username}: {activity_details}")
        
        # return the collected data
        return {
            "username": username,
            "stats": {
                "prs_created": len(prs),
                "prs_merged": merged_prs_count,
                "issues_assigned": len(assigned_issues),
                "comments": len(comments),
                "last_activity_date": last_activity_date,
                "last_activity_type": last_activity_type,
                "last_activity_display": last_activity_display
            },
            "has_assigned_issues": has_assigned_issues,
            "is_inactive": is_inactive,
            "inactivity_reason": inactivity_reason,
            "has_no_issues": has_no_issues,
            "last_assigned_date": last_assigned_date
        }
    except Exception as e:
        logger.error(f"Error collecting data for {username}: {str(e)}")
        # return fallback data to avoid breaking the entire script for one user
        return {
            "username": username,
            "stats": {
                "prs_created": 0,
                "prs_merged": 0,
                "issues_assigned": 0,
                "comments": 0,
                "last_activity_date": None,
                "last_activity_type": None,
                "last_activity_display": "error collecting data"
            },
            "has_assigned_issues": False,
            "is_inactive": True,
            "inactivity_reason": f"error collecting data: {str(e)}",
            "has_no_issues": True,
            "last_assigned_date": None
        }

def check_recent_activity(github, username, cutoff_date_str):
    """check if a user has any activity since a given date"""
    # check for prs created
    prs, _ = github.get_user_prs(username, cutoff_date_str, check_existence_only=True)
    if prs:
        return True, "created a pull request"
    
    # check for pr drafts and unmerged prs (this is a separate check to see all pr activity)
    open_prs = github.get_user_open_prs(username)
    if open_prs:
        # check if any were updated after the cutoff date
        for pr in open_prs:
            updated_at = pr.get("updated_at")
            if updated_at and updated_at >= cutoff_date_str:
                return True, "has active pull requests"
    
    # check for comments
    comments = github.get_user_comments(username, cutoff_date_str, check_existence_only=True)
    if comments:
        return True, "commented on issues"
    
    # no activity found
    return False, None

def check_activity_since_assignment(github, username, assignment_date, inactivity_threshold_days):
    """check if a user has any activity since assignment date + grace period"""
    if not assignment_date:
        return False
    
    try:
        # convert string date to datetime
        since_datetime = datetime.strptime(assignment_date, "%Y-%m-%dT%H:%M:%SZ")
        
        # add grace period for inactivity (7 days)
        since_datetime += timedelta(days=inactivity_threshold_days)
        
        # if the grace period hasn't passed yet, they're not inactive
        if since_datetime > datetime.now():
            logger.debug(f"  {username}'s grace period hasn't expired yet (assigned within {inactivity_threshold_days} days)")
            return True
        
        # format date for api
        adjusted_since_date = since_datetime.strftime("%Y-%m-%dT%H:%M:%SZ")
        
        # check for any activity since the adjusted date
        has_activity, activity_type = check_recent_activity(github, username, adjusted_since_date)
        
        if has_activity:
            logger.debug(f"  {username} has been active since {inactivity_threshold_days} days after assignment ({activity_type})")
        else:
            logger.debug(f"  {username} has NOT been active since {inactivity_threshold_days} days after assignment")
        
        return has_activity
    except Exception as e:
        logger.error(f"Error checking activity since assignment for {username}: {str(e)}")
        return False

def get_team_members(github):
    """get all team members who have access to the repo"""
    teams = github.get_teams()
    all_members = []
    
    for team in teams:
        team_members = github.get_team_members(team["members_url"])
        all_members.extend(team_members)
    
    return list(set(all_members))  # remove duplicates 