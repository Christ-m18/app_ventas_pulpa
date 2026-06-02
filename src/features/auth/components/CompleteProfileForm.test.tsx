import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { CompleteProfileForm } from "./CompleteProfileForm";

const mockUpdate = vi.hoisted(() => vi.fn());
const mockGetUser = vi.hoisted(() => vi.fn());
const mockRouterPush = vi.hoisted(() => vi.fn());
const mockRouterRefresh = vi.hoisted(() => vi.fn());

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: { getUser: mockGetUser },
    from: () => ({
      update: () => ({
        eq: mockUpdate,
      }),
    }),
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockRouterPush,
    replace: vi.fn(),
    refresh: mockRouterRefresh,
  }),
}));

describe("CompleteProfileForm", () => {
  beforeEach(() => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-123" } } });
    mockUpdate.mockResolvedValue({ error: null });
    mockRouterPush.mockReset();
    mockRouterRefresh.mockReset();
  });

  it("renders the phone input and submit button", () => {
    render(<CompleteProfileForm />);
    expect(screen.getByLabelText(/teléfono/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /continuar/i })).toBeInTheDocument();
  });

  it("shows validation error for empty phone on submit", async () => {
    render(<CompleteProfileForm />);
    fireEvent.click(screen.getByRole("button", { name: /continuar/i }));
    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });

  it("calls supabase update and redirects on valid phone", async () => {
    render(<CompleteProfileForm />);
    const phoneInput = screen.getByLabelText(/teléfono/i);
    fireEvent.change(phoneInput, { target: { value: "+1 (809) 555-1234" } });
    fireEvent.click(screen.getByRole("button", { name: /continuar/i }));
    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalled();
      expect(mockRouterPush).toHaveBeenCalledWith("/tienda");
    });
  });
});
