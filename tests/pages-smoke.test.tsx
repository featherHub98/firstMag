import { render, screen, waitFor } from "@testing-library/react";
import App from "@/App";

function renderAt(path: string) {
  window.history.pushState({}, "test", path);
  return render(<App />);
}

describe("Page route smoke coverage", () => {
  it("renders dashboard route", async () => {
    renderAt("/dashboard");
    await waitFor(() => {
      expect(screen.getAllByText(/Tableau de bord|dashboard/i).length).toBeGreaterThan(0);
    });
  });

  it("renders pos route", async () => {
    renderAt("/pos");
    await waitFor(() => {
      expect(screen.getAllByText(/Caisse|POS/i).length).toBeGreaterThan(0);
    });
  });

  it("renders sales route", async () => {
    renderAt("/sales");
    await waitFor(() => {
      expect(screen.getAllByText(/Ventes|Sales/i).length).toBeGreaterThan(0);
    });
  });

  it("renders stock route", async () => {
    renderAt("/stock");
    await waitFor(() => {
      expect(screen.getAllByText(/Stock/i).length).toBeGreaterThan(0);
    });
  });

  it("renders articles route", async () => {
    renderAt("/articles");
    await waitFor(() => {
      expect(screen.getAllByText(/Articles/i).length).toBeGreaterThan(0);
    });
  });

  it("renders partners route", async () => {
    renderAt("/partners");
    await waitFor(() => {
      expect(screen.getAllByText(/Tiers|Clients|Partners/i).length).toBeGreaterThan(0);
    });
  });

  it("renders crm route", async () => {
    renderAt("/crm");
    await waitFor(() => {
      expect(screen.getAllByText(/CRM/i).length).toBeGreaterThan(0);
    });
  });

  it("renders reports route", async () => {
    renderAt("/reports");
    await waitFor(() => {
      expect(screen.getAllByText(/É|Etat|Reports|Rapport/i).length).toBeGreaterThan(0);
    });
  });

  it("renders settings route", async () => {
    renderAt("/settings");
    await waitFor(() => {
      expect(screen.getAllByText(/Config|Param|Settings/i).length).toBeGreaterThan(0);
    });
  });
});
