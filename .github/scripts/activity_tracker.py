import os
import sys
import requests
from datetime import datetime, timedelta
import json
from dotenv import load_dotenv

# load environment variables
load_dotenv()

# github api token from environment variables
github_token = os.environ.get("GH_TOKEN")

# discord webhook url from environment variables
discord_webhook_url = os.environ.get("DISCORD_WEBHOOK_URL")
# repository in format "owner/repo"
repository = os.environ.get("GITHUB_REPOSITORY")
# number of days of inactivity before notification (default: 7)
inactivity_threshold_days = int(os.environ.get("INACTIVITY_THRESHOLD_DAYS", 7))
# number of days without assigned issues threshold (default: 3)
no_issues_threshold_days = int(os.environ.get("NO_ISSUES_THRESHOLD_DAYS", 3))
# comma-separated list of active developer github handles to track
active_devs_list = os.environ.get("ACTIVE_DEVS", "")

# check for required environment variables
if not github_token:
    print("Error: GITHUB_TOKEN not set")
    sys.exit(1)
if not discord_webhook_url:
    print("Error: DISCORD_WEBHOOK_URL not set")
    sys.exit(1)
if not repository:
    print("Error: GITHUB_REPOSITORY not set")
    sys.exit(1)

# api headers
headers = {
    "Authorization": f"token {github_token}",
    "Accept": "application/vnd.github.v3+json",
}

# -------------------- UTILITY FUNCTIONS --------------------

def format_date_display(date_str):
    """format date string for display"""
    if not date_str:
        return "unknown"
        
    date_time = datetime.strptime(date_str, "%Y-%m-%dT%H:%M:%SZ")
    days_ago = (datetime.now() - date_time).days
    
    if days_ago == 0:
        return "today"
    elif days_ago == 1:
        return "yesterday"
    else:
        return f"{days_ago} days ago"

def parse_active_devs():
    """parse active developers list from environment variable"""
    if not active_devs_list:
        return []
    
    # remove whitespace and filter out empty strings
    devs = [dev.strip() for dev in active_devs_list.split(",")]
    return [dev for dev in devs if dev]

# -------------------- DATA COLLECTION FUNCTIONS --------------------

def get_all_contributors():
    """Get all contributors to the repository"""
    contributors_url = f"https://api.github.com/repos/{repository}/contributors"
    params = {"per_page": 100}
    
    response = requests.get(contributors_url, headers=headers, params=params)
    if response.status_code != 200:
        print(f"error fetching contributors: {response.status_code}")
        print(response.text)
        return []
        
    contributors = response.json()
    return [contributor["login"] for contributor in contributors]

def get_team_members():
    """get all team members who have access to the repo"""
    teams_url = f"https://api.github.com/repos/{repository}/teams"
    
    response = requests.get(teams_url, headers=headers)
    if response.status_code != 200:
        print(f"error fetching teams: {response.status_code}")
        print(response.text)
        return []
    
    all_members = []
    teams = response.json()
    
    for team in teams:
        team_members_url = team["members_url"].replace("{/member}", "")
        
        members_response = requests.get(team_members_url, headers=headers)
        if members_response.status_code != 200:
            print(f"error fetching team members: {members_response.status_code}")
            continue
        
        members = members_response.json()
        all_members.extend([member["login"] for member in members])
    
    return list(set(all_members))  # remove duplicates

def get_collaborators():
    """get all collaborators on the repository"""
    collaborators_url = f"https://api.github.com/repos/{repository}/collaborators"
    
    response = requests.get(collaborators_url, headers=headers)
    if response.status_code != 200:
        print(f"error fetching collaborators: {response.status_code}")
        print(response.text)
        return []
    
    collaborators = response.json()
    return [collaborator["login"] for collaborator in collaborators]

# -------------------- GITHUB DATA FETCHING --------------------

def get_user_commits(username, since_date=None, check_existence_only=False):
    """get user commits, optionally after a specific date"""
    commits_url = f"https://api.github.com/repos/{repository}/commits"
    params = {
        "author": username,
        "per_page": 1 if check_existence_only else 100
    }
    
    if since_date:
        params["since"] = since_date
        
    response = requests.get(commits_url, headers=headers, params=params)
    if response.status_code != 200:
        return []
        
    return response.json()

def get_user_prs(username, since_date=None, check_existence_only=False, merged_only=False):
    """get pull requests created by user, optionally after a specific date"""
    prs_url = f"https://api.github.com/search/issues"
    
    query = f"repo:{repository} author:{username} type:pr"
    if since_date:
        query += f" created:>={since_date}"
    if merged_only:
        query += " is:merged"
        if since_date:
            query += f" merged:>={since_date}"
    
    params = {
        "q": query,
        "per_page": 1 if check_existence_only else 100,
        "sort": "updated",
        "order": "desc"
    }
    
    response = requests.get(prs_url, headers=headers, params=params)
    if response.status_code != 200:
        return [], 0  # return empty list and 0 count on error
        
    results = response.json()
    return results.get("items", []), results.get("total_count", 0)

def get_user_comments(username, since_date=None, check_existence_only=False):
    """get comments made by user, optionally after a specific date"""
    comments_url = f"https://api.github.com/search/issues"
    
    query = f"repo:{repository} commenter:{username}"
    if since_date:
        query += f" updated:>={since_date}"
    
    params = {
        "q": query,
        "per_page": 1 if check_existence_only else 100,
        "sort": "updated",
        "order": "desc"
    }
    
    response = requests.get(comments_url, headers=headers, params=params)
    if response.status_code != 200:
        return []
        
    results = response.json()
    return results.get("items", [])

def get_assigned_issues(username):
    """get issues currently assigned to a user"""
    issues_url = f"https://api.github.com/repos/{repository}/issues"
    params = {
        "assignee": username,
        "state": "open",
        "per_page": 100,
    }
    
    print(f"  checking issues assigned to {username}")
    response = requests.get(issues_url, headers=headers, params=params)
    if response.status_code != 200:
        print(f"  error fetching issues for {username}: {response.status_code}")
        return []
        
    issues = response.json()
    filtered_issues = [issue for issue in issues if not issue.get("pull_request")]
    
    # Print detected issues for debugging
    if filtered_issues:
        issue_numbers = [str(issue["number"]) for issue in filtered_issues]
        print(f"  found {len(filtered_issues)} issues assigned to {username}: #{', #'.join(issue_numbers)}")
    else:
        print(f"  no issues found assigned to {username}")
    
    return filtered_issues

def get_issue_assignment_date(issue_number, username):
    """get the date when a specific issue was assigned to a user"""
    events_url = f"https://api.github.com/repos/{repository}/issues/{issue_number}/timeline"
    headers_with_timeline = headers.copy()
    headers_with_timeline["Accept"] = "application/vnd.github.mockingbird-preview+json"
    
    response = requests.get(events_url, headers=headers_with_timeline)
    if response.status_code != 200:
        print(f"  error fetching issue timeline: {response.status_code}")
        return None
    
    events = response.json()
    
    # find assignment events for this user
    for event in events:
        if (event.get("event") == "assigned" and 
            event.get("assignee", {}).get("login") == username):
            assignment_date = event.get("created_at")
            print(f"  issue #{issue_number} was assigned to {username} on {assignment_date}")
            return assignment_date
    
    print(f"  no assignment event found for {username} on issue #{issue_number}")
    return None

def get_last_assigned_date(username):
    """find the most recent date a user was assigned an issue"""
    issues_url = f"https://api.github.com/search/issues"
    query = f"repo:{repository} assignee:{username} state:open state:closed"
    params = {
        "q": query,
        "sort": "updated",
        "order": "desc",
        "per_page": 100,
    }
    
    response = requests.get(issues_url, headers=headers, params=params)
    if response.status_code != 200:
        print(f"error searching issues for {username}: {response.status_code}")
        return None
    
    issues = response.json().get("items", [])
    if not issues:
        return None
    
    # get the timeline for the most recently updated issue to find assignment date
    for issue in issues:
        events_url = f"https://api.github.com/repos/{repository}/issues/{issue['number']}/timeline"
        headers_with_timeline = headers.copy()
        headers_with_timeline["Accept"] = "application/vnd.github.mockingbird-preview+json"
        
        response = requests.get(events_url, headers=headers_with_timeline)
        if response.status_code != 200:
            continue
        
        events = response.json()
        
        # find assignment events
        for event in events:
            if (event.get("event") == "assigned" and 
                event.get("assignee", {}).get("login") == username):
                return event.get("created_at")
    
    return None

# -------------------- DEVELOPER ANALYTICS --------------------

def check_recent_activity(username, cutoff_date_str):
    """check if a user has any activity since a given date"""
    # Check for commits
    commits = get_user_commits(username, cutoff_date_str, check_existence_only=True)
    if commits:
        return True, "committed code"
    
    # Check for PRs created
    prs, _ = get_user_prs(username, cutoff_date_str, check_existence_only=True)
    if prs:
        return True, "created a pull request"
    
    # Check for comments
    comments = get_user_comments(username, cutoff_date_str, check_existence_only=True)
    if comments:
        return True, "commented on issues"
    
    # No activity found
    return False, None

def check_activity_since_assignment(username, assignment_date):
    """check if a user has any activity since assignment date + grace period"""
    if not assignment_date:
        return False
    
    # convert string date to datetime
    since_datetime = datetime.strptime(assignment_date, "%Y-%m-%dT%H:%M:%SZ")
    
    # add grace period for inactivity (7 days)
    since_datetime += timedelta(days=inactivity_threshold_days)
    
    # if the grace period hasn't passed yet, they're not inactive
    if since_datetime > datetime.now():
        print(f"  {username}'s grace period hasn't expired yet (assigned within {inactivity_threshold_days} days)")
        return True
    
    # format date for API
    adjusted_since_date = since_datetime.strftime("%Y-%m-%dT%H:%M:%SZ")
    
    # check for any activity since the adjusted date
    has_activity, activity_type = check_recent_activity(username, adjusted_since_date)
    
    if has_activity:
        print(f"  {username} has been active since {inactivity_threshold_days} days after assignment ({activity_type})")
    else:
        print(f"  {username} has NOT been active since {inactivity_threshold_days} days after assignment")
    
    return has_activity

def collect_developer_data(username):
    """collect all data for a single developer in one operation to avoid duplicate API calls"""
    print(f"collecting data for {username}...")
    
    # Define cutoff dates
    inactivity_cutoff = datetime.now() - timedelta(days=inactivity_threshold_days)
    inactivity_cutoff_str = inactivity_cutoff.strftime("%Y-%m-%dT%H:%M:%SZ")
    
    no_issues_cutoff = datetime.now() - timedelta(days=no_issues_threshold_days)
    no_issues_cutoff_str = no_issues_cutoff.strftime("%Y-%m-%dT%H:%M:%SZ")
    
    stats_cutoff = datetime.now() - timedelta(days=30)  # 30 days for general stats
    stats_cutoff_str = stats_cutoff.strftime("%Y-%m-%dT%H:%M:%SZ")
    
    # Get assigned issues
    assigned_issues = get_assigned_issues(username)
    has_assigned_issues = len(assigned_issues) > 0
    
    # Check for recent activity
    has_recent_activity, activity_type = check_recent_activity(username, inactivity_cutoff_str)
    
    # Get activity stats for the past 30 days
    commits = get_user_commits(username, stats_cutoff_str)
    prs, _ = get_user_prs(username, stats_cutoff_str)
    _, merged_prs_count = get_user_prs(username, stats_cutoff_str, merged_only=True)
    comments = get_user_comments(username, stats_cutoff_str)
    
    # Find the most recent activity
    last_activity_date = None
    last_activity_type = None
    
    # Check commits for last activity
    if commits:
        commit_date = commits[0].get("commit", {}).get("author", {}).get("date")
        if commit_date:
            last_activity_date = commit_date
            last_activity_type = "commit"
    
    # Check PRs for last activity
    if prs:
        pr_date = prs[0].get("updated_at")
        if pr_date and (not last_activity_date or pr_date > last_activity_date):
            last_activity_date = pr_date
            last_activity_type = "PR"
    
    # Check comments for last activity
    if comments:
        comment_date = comments[0].get("updated_at")
        if comment_date and (not last_activity_date or comment_date > last_activity_date):
            last_activity_date = comment_date
            last_activity_type = "comment"
    
    # Determine if inactive based on our criteria
    is_inactive = False
    inactivity_reason = None
    
    if not has_recent_activity:
        if has_assigned_issues:
            # Check if active since assignment + grace period for any assigned issue
            active_since_assignment = False
            for issue in assigned_issues:
                issue_number = issue.get("number")
                assignment_date = get_issue_assignment_date(issue_number, username)
                if check_activity_since_assignment(username, assignment_date):
                    active_since_assignment = True
                    break
                    
            is_inactive = not active_since_assignment
            if is_inactive:
                inactivity_reason = "no activity since issue assignment"
        else:
            # No assigned issues and no recent activity
            is_inactive = True
            inactivity_reason = "no recent activity and no assigned issues"
    
    # Check if user has no issues and further analyze inactivity reasons
    has_no_issues = False
    last_assigned_date = None
    if not has_assigned_issues:
        last_assigned_date = get_last_assigned_date(username)
        if not last_assigned_date or datetime.strptime(last_assigned_date, "%Y-%m-%dT%H:%M:%SZ") <= no_issues_cutoff:
            has_no_issues = True
    
    # Format the last activity date for display
    last_activity_display = "never"
    if last_activity_date:
        last_activity_display = format_date_display(last_activity_date)
    
    # More detailed inactivity reasons
    if is_inactive and not inactivity_reason:
        if len(commits) == 0:
            inactivity_reason = "no commits in past 30 days"
        elif len(prs) == 0:
            inactivity_reason = "no pull requests created recently"
        elif merged_prs_count == 0:
            inactivity_reason = "no pull requests merged recently"
        elif len(comments) == 0:
            inactivity_reason = "no comments on issues/prs recently"
        else:
            inactivity_reason = f"no activity in the past {inactivity_threshold_days} days"
    
    # Return the collected data
    return {
        "username": username,
        "stats": {
            "commits": len(commits),
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

# -------------------- NOTIFICATIONS --------------------

def send_discord_notification(all_data):
    """send notification to discord with the results"""
    if not all_data:
        print("no developers to notify")
        return
    
    # Extract lists for different types of developers
    inactive_devs = [
        {"username": dev["username"], "last_active": dev["stats"]["last_activity_display"], "reason": dev["inactivity_reason"]}
        for dev in all_data if dev["is_inactive"]
    ]
    
    no_issues_devs = [
        {"username": dev["username"], "last_assigned": format_date_display(dev["last_assigned_date"])}
        for dev in all_data if dev["has_no_issues"]
    ]
    
    dev_stats = [
        {
            "username": dev["username"],
            "commits": dev["stats"]["commits"],
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
        print("no developers to notify")
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
            key=lambda x: (x['commits'] + x['prs_created'] + x['prs_merged'] + x['comments']),
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
            total_activity = dev['commits'] + dev['prs_created'] + dev['prs_merged'] + dev['comments']
            
            # Create emojis based on activity levels
            commit_emoji = "🔥" if dev['commits'] > 5 else "✅" if dev['commits'] > 0 else "⬜"
            pr_emoji = "🔥" if dev['prs_created'] > 3 else "✅" if dev['prs_created'] > 0 else "⬜"
            merged_emoji = "🔥" if dev['prs_merged'] > 3 else "✅" if dev['prs_merged'] > 0 else "⬜"
            issues_emoji = "🔥" if dev['issues_assigned'] > 2 else "✅" if dev['issues_assigned'] > 0 else "⬜"
            comments_emoji = "🔥" if dev['comments'] > 5 else "✅" if dev['comments'] > 0 else "⬜"
            
            # create a summary of their activity
            activity_summary = (
                f"{commit_emoji} **{dev['commits']}** commits\n"
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
            "description": f"these developers have had no activity in the past **{inactivity_threshold_days} days**.",
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
            "description": f"these developers have not had issues assigned for **{no_issues_threshold_days}+ days**.",
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
                "value": "- provide status updates on discord\n- commit your work in progress daily",
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
    response = requests.post(discord_webhook_url, json=payload)
    
    if response.status_code not in [200, 204]:
        print(f"error sending discord notification: {response.status_code}")
        print(response.text)
    else:
        print(f"successfully sent discord notification")
        if has_inactive:
            print(f"- {len(inactive_devs)} inactive developers")
        if has_no_issues:
            print(f"- {len(no_issues_devs)} developers without assigned issues")
        if has_dev_stats:
            print(f"- included activity summary for {len(dev_stats)} developers")

# -------------------- MAIN FUNCTION --------------------

def main():
    print(f"checking for developer activity issues in {repository}...")
    print(f"inactivity threshold: {inactivity_threshold_days} days")
    print(f"no issues threshold: {no_issues_threshold_days} days")
    
    # get developers to track
    active_devs = parse_active_devs()
    
    # if active_devs list is provided, use it, otherwise fetch all contributors/team members/collaborators
    if active_devs:
        all_developers = active_devs
        print(f"using provided list of {len(all_developers)} developers to track")
    else:
        # get all developers to track
        contributors = get_all_contributors()
        team_members = get_team_members()
        collaborators = get_collaborators()
        
        # combine all developers and remove duplicates
        all_developers = list(set(contributors + team_members + collaborators))
        print(f"found {len(all_developers)} developers to track")
    
    # collect data for all developers
    all_data = []
    for username in all_developers:
        dev_data = collect_developer_data(username)
        all_data.append(dev_data)
    
    # print summary of findings
    inactive_count = sum(1 for dev in all_data if dev["is_inactive"])
    no_issues_count = sum(1 for dev in all_data if dev["has_no_issues"])
    
    print(f"found {inactive_count} inactive developers")
    print(f"found {no_issues_count} developers without assigned issues")
    print(f"gathered stats for {len(all_data)} developers")
    
    # send discord notification
    send_discord_notification(all_data)

if __name__ == "__main__":
    main() 