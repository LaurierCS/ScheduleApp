import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import SignupForm from "./SignupForm";

const registerMock = vi.fn();
const clearErrorMock = vi.fn();
const navigateMock = vi.fn();

vi.mock("@/features/auth/hooks/useAuth", () => ({
  useAuth: () => ({
    register: registerMock,
    isLoading: false,
    error: null,
    clearError: clearErrorMock,
  }),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom"
  );
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

const fillAccountStep = async () => {
  const user = userEvent.setup();

  await user.type(screen.getByLabelText(/first name/i), "Jane");
  await user.type(screen.getByLabelText(/last name/i), "Doe");
  await user.type(screen.getByLabelText(/email address/i), "jane@example.com");
  await user.type(screen.getByPlaceholderText(/create a strong password/i), "Strong1!");
  await user.click(screen.getByRole("button", { name: /continue/i }));

  return user;
};

describe("SignupForm", () => {
  beforeEach(() => {
    registerMock.mockReset();
    clearErrorMock.mockReset();
    navigateMock.mockReset();
    sessionStorage.clear();
  });

  it("requires an invite code when joining a team", async () => {
    render(
      <MemoryRouter>
        <SignupForm />
      </MemoryRouter>
    );

    const user = await fillAccountStep();

    await user.click(screen.getByRole("button", { name: /join a team/i }));

    const submitButton = screen.getByRole("button", { name: /create account/i });
    expect(submitButton).toBeDisabled();
    expect(registerMock).not.toHaveBeenCalled();
  });

  it("stores team onboarding details when creating a team", async () => {
    registerMock.mockResolvedValue({
      id: "user-1",
      name: "Jane Doe",
      email: "jane@example.com",
      role: "candidate",
      isActive: true,
    });

    render(
      <MemoryRouter>
        <SignupForm />
      </MemoryRouter>
    );

    const user = await fillAccountStep();

    await user.click(screen.getByRole("button", { name: /create a team/i }));
    await user.type(screen.getByLabelText(/team name/i), "Acme Recruiting");
    await user.type(
      screen.getByLabelText(/team description/i),
      "Recruiting for product and engineering."
    );
    await user.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(registerMock).toHaveBeenCalledWith(
        "Jane Doe",
        "jane@example.com",
        "Strong1!",
        undefined
      );
    });

    const stored = sessionStorage.getItem("signupTeamOnboarding");
    expect(stored).toContain("Acme Recruiting");
  });
});
