import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { mockIPC } from "@tauri-apps/api/mocks";
import LoginModal from "@/components/LoginModal";
import { useSessionStore } from "@/stores/sessionStore";
import { useUiStore } from "@/stores/uiStore";

describe("Login modal keyboard PIN", () => {
  it("accepts keyboard digits and Enter to log in", async () => {
    mockIPC((cmd, args) => {
      if (cmd === "login_user") {
        const payload = (args as Record<string, unknown> | undefined) ?? {};
        if (payload.pin === "1234") {
          return {
            id: "1",
            name: "Admin Test",
            role: "admin",
            permissions: ["*"],
          };
        }
        throw new Error("Code PIN incorrect");
      }
      return null;
    });

    useSessionStore.getState().clear();
    useSessionStore.getState().setUser("", "Invite", "guest", []);
    useUiStore.setState({ loginOpen: true });

    render(<LoginModal />);

    const enterButton = screen.getByRole("button", { name: /Entrer/i });
    expect(enterButton).toBeDisabled();

    for (const key of ["1", "2", "3", "4"]) {
      fireEvent.keyDown(window, { key });
    }
    expect(enterButton).toBeEnabled();

    fireEvent.keyDown(window, { key: "Enter" });

    await waitFor(() => {
      expect(useSessionStore.getState().currentUserName).toBe("Admin Test");
    });
  });
});
