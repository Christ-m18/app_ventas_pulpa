import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { SocialAuthButtons } from "./SocialAuthButtons";

const mockSignInWithOAuth = vi.hoisted(() => vi.fn());

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      signInWithOAuth: mockSignInWithOAuth,
    },
  },
}));

describe("SocialAuthButtons", () => {
  beforeEach(() => {
    mockSignInWithOAuth.mockReset();
    mockSignInWithOAuth.mockResolvedValue({ error: null });
  });

  it("renders Google and Facebook buttons", () => {
    render(<SocialAuthButtons />);
    expect(screen.getByRole("button", { name: /google/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /facebook/i })).toBeInTheDocument();
  });

  it("calls signInWithOAuth with google when Google button is clicked", async () => {
    render(<SocialAuthButtons />);
    fireEvent.click(screen.getByRole("button", { name: /google/i }));
    await waitFor(() => {
      expect(mockSignInWithOAuth).toHaveBeenCalledWith(
        expect.objectContaining({ provider: "google" })
      );
    });
  });

  it("calls signInWithOAuth with facebook when Facebook button is clicked", async () => {
    render(<SocialAuthButtons />);
    fireEvent.click(screen.getByRole("button", { name: /facebook/i }));
    await waitFor(() => {
      expect(mockSignInWithOAuth).toHaveBeenCalledWith(
        expect.objectContaining({ provider: "facebook" })
      );
    });
  });

  it("disables both buttons while a provider is loading", async () => {
    mockSignInWithOAuth.mockImplementation(() => new Promise(() => {})); // never resolves
    render(<SocialAuthButtons />);
    fireEvent.click(screen.getByRole("button", { name: /google/i }));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /google/i })).toBeDisabled();
      expect(screen.getByRole("button", { name: /facebook/i })).toBeDisabled();
    });
  });
});
