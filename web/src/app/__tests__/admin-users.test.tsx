import { render, screen, waitFor } from "@testing-library/react";
import AdminUsersPage from "@/app/admin/users/page";
import apiClient from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: jest.fn() })
}));

jest.mock("@/context/AuthContext", () => ({
  useAuth: jest.fn()
}));

jest.mock("@/lib/api", () => ({
  __esModule: true,
  default: { get: jest.fn() }
}));

describe("AdminUsersPage", () => {
  beforeEach(() => {
    jest.mocked(useAuth).mockReturnValue({
      isReady: true,
      user: { id: "admin-1", userType: "admin" }
    } as ReturnType<typeof useAuth>);
    jest.mocked(apiClient.get).mockResolvedValue({
      data: {
        data: [{
          id: "customer-1",
          firstName: "Test",
          lastName: "Customer",
          email: "customer@example.test",
          userType: "customer",
          createdAt: "2026-10-01T00:00:00.000Z"
        }]
      }
    });
  });

  it("lists users without showing an inactive view action", async () => {
    render(<AdminUsersPage />);

    expect(await screen.findByText("customer@example.test")).toBeInTheDocument();
    await waitFor(() => expect(apiClient.get).toHaveBeenCalledWith("/users"));
    expect(screen.queryByRole("button", { name: "View" })).not.toBeInTheDocument();
    expect(screen.getByRole("table", { name: "Marketplace users" })).toBeInTheDocument();
  });
});
