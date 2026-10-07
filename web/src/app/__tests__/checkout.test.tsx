import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import CheckoutPage from "@/app/checkout/page";
import apiClient from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

const mockPush = jest.fn();
const mockPost = jest.mocked(apiClient.post);
const mockClear = jest.fn();
const mockAddItem = jest.fn();
const mockCart = {
  items: [{ productId: "product-1", name: "Test part", price: 1250, quantity: 1 }],
  total: 1250,
  addItem: mockAddItem,
  removeItem: jest.fn(),
  updateQuantity: jest.fn(),
  clear: mockClear,
  isReady: true,
  syncStatus: "guest" as const,
  retrySync: jest.fn()
};
const mockLocation = {
  lat: -1.286389,
  lng: 36.817223,
  address: {
    street: "Test Street",
    city: "Nairobi",
    state: "Nairobi",
    postalCode: "00100",
    country: "Kenya",
    label: "Test Street, Nairobi"
  }
};

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn(), back: jest.fn() }),
  useSearchParams: () => new URLSearchParams()
}));

jest.mock("@/context/AuthContext", () => ({
  useAuth: jest.fn()
}));

jest.mock("@/context/CartContext", () => ({
  useCart: jest.fn()
}));

jest.mock("@/lib/api", () => ({
  __esModule: true,
  default: { post: jest.fn(), get: jest.fn() }
}));

jest.mock("@/components/DeliveryMap", () => ({
  __esModule: true,
  default: ({ onLocationChange }: { onLocationChange: (location: typeof mockLocation) => void }) => (
    <button type="button" onClick={() => onLocationChange(mockLocation)}>
      Set test delivery location
    </button>
  )
}));

describe("CheckoutPage", () => {
  beforeEach(() => {
    jest.mocked(useCart).mockReturnValue(mockCart);
    jest.mocked(useAuth).mockReturnValue({
      user: { id: "customer-1", userType: "customer" }
    } as ReturnType<typeof useAuth>);
    mockPost.mockResolvedValue({
      data: { data: { orderId: "order-123", fallback: false } }
    });
  });

  it("requires a signed-in customer and keeps the cart available", () => {
    jest.mocked(useAuth).mockReturnValue({ user: null } as ReturnType<typeof useAuth>);

    render(<CheckoutPage />);

    expect(screen.getByText(/sign in or create a customer account/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in to place order/i })).toBeDisabled();
    expect(mockPost).not.toHaveBeenCalled();
    expect(mockClear).not.toHaveBeenCalled();
  });

  it("allows an authenticated customer to place a cash-on-delivery order", async () => {
    render(<CheckoutPage />);

    expect(screen.getByRole("radio", { name: /m-pesa/i })).toBeDisabled();
    expect(screen.getByRole("radio", { name: /card payment/i })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: /set test delivery location/i }));
    fireEvent.click(screen.getByRole("button", { name: /place cash-on-delivery order/i }));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith("/orders", expect.objectContaining({
        paymentMethod: "cash_on_delivery"
      }));
      expect(mockClear).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith("/order-success?orderId=order-123");
    });
  });

  it("does not clear the cart or report success when the API returns a fallback order", async () => {
    mockPost.mockResolvedValue({
      data: { data: { orderId: "temporary-order", fallback: true } }
    });

    render(<CheckoutPage />);
    fireEvent.click(screen.getByRole("button", { name: /set test delivery location/i }));
    fireEvent.click(screen.getByRole("button", { name: /place cash-on-delivery order/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/order service is temporarily unavailable/i);
    expect(mockClear).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });
});
