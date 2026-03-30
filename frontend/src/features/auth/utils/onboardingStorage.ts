/**
 * Signup onboarding storage helpers
 * Keeps team onboarding state in sessionStorage during email verification
 */

export type TeamChoice = 'join' | 'create';

export interface TeamOnboardingData {
    choice: TeamChoice;
    team?: {
        name: string;
        description?: string;
    };
}

const TEAM_ONBOARDING_KEY = 'signupTeamOnboarding';

export const setTeamOnboarding = (data: TeamOnboardingData): void => {
    sessionStorage.setItem(TEAM_ONBOARDING_KEY, JSON.stringify(data));
};

export const getTeamOnboarding = (): TeamOnboardingData | null => {
    const stored = sessionStorage.getItem(TEAM_ONBOARDING_KEY);
    if (!stored) return null;

    try {
        return JSON.parse(stored) as TeamOnboardingData;
    } catch {
        return null;
    }
};

export const clearTeamOnboarding = (): void => {
    sessionStorage.removeItem(TEAM_ONBOARDING_KEY);
};
