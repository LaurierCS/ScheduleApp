import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AddTeamMembers from "@/features/admin/components/AddTeamMembers";

const sendInvitesMock = vi.fn();
const refreshMock = vi.fn();

vi.mock("@/features/admin/hooks", () => ({
  useTeamInviteData: () => ({
    teamId: "team-1",
    isAdmin: true,
    settings: { roles: ["Designer"], departments: ["Engineering"] },
    candidates: [],
    interviewers: [],
    isLoading: false,
    error: null,
    refresh: refreshMock,
    removeCandidate: vi.fn(),
    removeInterviewer: vi.fn(),
  }),
  useInviteActions: () => ({
    recentInvites: [],
    status: null,
    isSending: false,
    sendInvites: sendInvitesMock,
    resendInvite: vi.fn(),
    dismissInvite: vi.fn(),
    clearStatus: vi.fn(),
  }),
}));

describe("AddTeamMembers", () => {
  beforeEach(() => {
    sendInvitesMock.mockReset();
    refreshMock.mockReset();
  });

  it("sends interviewer invites when role is toggled", async () => {
    const user = userEvent.setup();
    sendInvitesMock.mockResolvedValue({ invitationsSent: 1, invitedEmails: [] });

    render(<AddTeamMembers />);

    await user.click(screen.getByRole("button", { name: /interviewer/i }));
    await user.type(
      screen.getByLabelText(/invite emails/i),
      "alex@example.com"
    );
    await user.click(screen.getByRole("button", { name: /send invites/i }));

    expect(sendInvitesMock).toHaveBeenCalledWith({
      teamId: "team-1",
      role: "interviewer",
      emails: ["alex@example.com"],
      message: undefined,
      source: "manual",
    });
  });
});
