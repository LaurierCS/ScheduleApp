#!/usr/bin/env python3

import requests
import logging
from datetime import datetime

logger = logging.getLogger("activity_tracker")

class GitHubClient:
    """class to handle github api interactions with rate limit handling and error tracking"""
    
    def __init__(self, token, repository):
        self.token = token
        self.repository = repository
        self.headers = {
            "Authorization": f"token {token}",
            "Accept": "application/vnd.github.v3+json",
        }
        self.rate_limit_remaining = 5000
        self.rate_limit_reset = 0
        self.request_count = 0
        
    def _handle_rate_limit(self, response):
        """track rate limit from response headers"""
        self.rate_limit_remaining = int(response.headers.get('X-RateLimit-Remaining', 5000))
        self.rate_limit_reset = int(response.headers.get('X-RateLimit-Reset', 0))
        
        if self.rate_limit_remaining < 10:
            reset_time = datetime.fromtimestamp(self.rate_limit_reset)
            now = datetime.now()
            wait_time = (reset_time - now).total_seconds()
            
            if wait_time > 0:
                logger.warning(f"GitHub API rate limit low ({self.rate_limit_remaining} remaining). Reset in {wait_time:.1f} seconds.")
                
                if wait_time < 300:
                    logger.info(f"Waiting {wait_time:.1f} seconds for rate limit reset...")
                    import time
                    time.sleep(wait_time + 1)
    
    def _handle_response_error(self, response, endpoint):
        """handle and log api errors"""
        if response.status_code == 403 and 'rate limit exceeded' in response.text.lower():
            reset_time = datetime.fromtimestamp(int(response.headers.get('X-RateLimit-Reset', 0)))
            now = datetime.now()
            wait_time = (reset_time - now).total_seconds()
            logger.error(f"Rate limit exceeded. Reset in {wait_time:.1f} seconds.")
        else:
            logger.error(f"GitHub API error: {response.status_code} - {response.text} (endpoint: {endpoint})")
    
    def get(self, endpoint, params=None):
        """make a get request to github api with error handling"""
        full_url = f"https://api.github.com/{endpoint}"
        self.request_count += 1
        
        if params is None:
            params = {}
            
        logger.debug(f"API Request #{self.request_count}: GET {full_url} params={params}")
        
        try:
            response = requests.get(full_url, headers=self.headers, params=params)
            self._handle_rate_limit(response)
            
            if response.status_code != 200:
                self._handle_response_error(response, full_url)
                return None
                
            return response.json()
        except Exception as e:
            logger.error(f"Request failed: {str(e)}")
            return None
    
    def get_contributors(self):
        """get all contributors to the repository"""
        endpoint = f"repos/{self.repository}/contributors"
        params = {"per_page": 100}
        
        contributors = self.get(endpoint, params)
        if not contributors:
            return []
            
        return [contributor["login"] for contributor in contributors]
    
    def get_teams(self):
        """get all teams for the repository"""
        endpoint = f"repos/{self.repository}/teams"
        
        teams = self.get(endpoint)
        if not teams:
            return []
            
        return teams
    
    def get_team_members(self, teams_url):
        """get team members from team url"""
        if teams_url.startswith("https://api.github.com/"):
            teams_url = teams_url[len("https://api.github.com/"):]
        
        teams_url = teams_url.replace("{/member}", "")
        
        members = self.get(teams_url)
        if not members:
            return []
            
        return [member["login"] for member in members]
    
    def get_collaborators(self):
        """get all collaborators for the repository"""
        endpoint = f"repos/{self.repository}/collaborators"
        
        collaborators = self.get(endpoint)
        if not collaborators:
            return []
            
        return [collaborator["login"] for collaborator in collaborators]
    
    def get_user_commits(self, username, since_date=None, check_existence_only=False):
        """get user commits, optionally after a specific date"""
        endpoint = f"repos/{self.repository}/commits"
        params = {
            "author": username,
            "per_page": 1 if check_existence_only else 100
        }
        
        if since_date:
            params["since"] = since_date
            
        commits = self.get(endpoint, params)
        if not commits:
            return []
            
        return commits
    
    def get_user_prs(self, username, since_date=None, check_existence_only=False, merged_only=False):
        """get pull requests created by user, optionally after a specific date"""
        endpoint = "search/issues"
        
        query = f"repo:{self.repository} author:{username} type:pr"
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
        
        result = self.get(endpoint, params)
        if not result:
            return [], 0
            
        return result.get("items", []), result.get("total_count", 0)
    
    def get_user_comments(self, username, since_date=None, check_existence_only=False):
        """get comments made by user, optionally after a specific date"""
        endpoint = "search/issues"
        
        query = f"repo:{self.repository} commenter:{username}"
        if since_date:
            query += f" updated:>={since_date}"
        
        params = {
            "q": query,
            "per_page": 1 if check_existence_only else 100,
            "sort": "updated",
            "order": "desc"
        }
        
        result = self.get(endpoint, params)
        if not result:
            return []
            
        return result.get("items", [])
    
    def get_assigned_issues(self, username):
        """get issues currently assigned to a user"""
        endpoint = f"repos/{self.repository}/issues"
        params = {
            "assignee": username,
            "state": "open",
            "per_page": 100,
        }
        
        logger.debug(f"Checking issues assigned to {username}")
        
        issues = self.get(endpoint, params)
        if not issues:
            return []
            
        filtered_issues = [issue for issue in issues if not issue.get("pull_request")]
        
        if filtered_issues:
            issue_numbers = [str(issue["number"]) for issue in filtered_issues]
            logger.debug(f"Found {len(filtered_issues)} issues assigned to {username}: #{', #'.join(issue_numbers)}")
        else:
            logger.debug(f"No issues found assigned to {username}")
        
        return filtered_issues
    
    def get_issue_timeline(self, issue_number):
        """get the timeline of events for an issue"""
        endpoint = f"repos/{self.repository}/issues/{issue_number}/timeline"
        headers_with_timeline = self.headers.copy()
        headers_with_timeline["Accept"] = "application/vnd.github.mockingbird-preview+json"
        
        full_url = f"https://api.github.com/{endpoint}"
        self.request_count += 1
        
        logger.debug(f"API Request #{self.request_count}: GET {full_url} (timeline)")
        
        try:
            response = requests.get(full_url, headers=headers_with_timeline)
            self._handle_rate_limit(response)
            
            if response.status_code != 200:
                self._handle_response_error(response, full_url)
                return None
                
            return response.json()
        except Exception as e:
            logger.error(f"Timeline request failed: {str(e)}")
            return None
    
    def get_issue_assignment_date(self, issue_number, username):
        """get the date when a specific issue was assigned to a user"""
        events = self.get_issue_timeline(issue_number)
        if not events:
            return None
        
        for event in events:
            if (event.get("event") == "assigned" and 
                event.get("assignee", {}).get("login") == username):
                assignment_date = event.get("created_at")
                logger.debug(f"Issue #{issue_number} was assigned to {username} on {assignment_date}")
                return assignment_date
        
        logger.debug(f"No assignment event found for {username} on issue #{issue_number}")
        return None
    
    def get_last_assigned_date(self, username):
        """find the most recent date a user was assigned an issue"""
        endpoint = "search/issues"
        query = f"repo:{self.repository} assignee:{username} state:open state:closed"
        params = {
            "q": query,
            "sort": "updated",
            "order": "desc",
            "per_page": 100,
        }
        
        result = self.get(endpoint, params)
        if not result or not result.get("items"):
            return None
        
        issues = result.get("items", [])
        
        for issue in issues:
            events = self.get_issue_timeline(issue['number'])
            if not events:
                continue
            
            for event in events:
                if (event.get("event") == "assigned" and 
                    event.get("assignee", {}).get("login") == username):
                    return event.get("created_at")
        
        return None
    
    def get_user_open_prs(self, username):
        """get all open prs for a user including drafts"""
        endpoint = f"repos/{self.repository}/pulls"
        params = {
            "creator": username,
            "state": "open",
            "per_page": 100
        }
        
        prs = self.get(endpoint, params)
        if not prs:
            return []
            
        return prs
    
    def get_pr_commits(self, pr_number):
        """get all commits in a pr"""
        endpoint = f"repos/{self.repository}/pulls/{pr_number}/commits"
        
        commits = self.get(endpoint)
        if not commits:
            return []
            
        filtered_commits = []
        for commit in commits:
            if commit is None:
                logger.warning(f"Filtered out None commit from PR #{pr_number}")
                continue
            filtered_commits.append(commit)
            
        return filtered_commits 