import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resetMockState, setMockLatency, mockQuestService } from "@/services/mock/game-service";
import { QuestForm } from "./quest-form";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), back: vi.fn() }) }));
const renderForm = () => render(<QueryClientProvider client={new QueryClient()}><QuestForm/></QueryClientProvider>);

describe("QuestForm", () => {
  beforeEach(() => { resetMockState(); setMockLatency(20); });
  afterEach(() => { setMockLatency(300); vi.restoreAllMocks(); });
  it("shows title and past-date validation", async () => {
    const user = userEvent.setup(); renderForm();
    await user.clear(screen.getByLabelText("Due date and time")); await user.type(screen.getByLabelText("Due date and time"), "2020-01-01T12:00");
    await user.click(screen.getByRole("button", { name: "Create quest" }));
    expect(await screen.findByText("Quest title must be at least 3 characters.")).toBeInTheDocument();
    expect(await screen.findByText("Due date must be in the future.")).toBeInTheDocument();
  });
  it("prevents duplicate form submission", async () => {
    const user = userEvent.setup(); const spy = vi.spyOn(mockQuestService, "create"); renderForm();
    await user.type(screen.getByLabelText("Quest title"), "One deliberate submission");
    const form = screen.getByRole("button", { name: "Create quest" }).closest("form")!;
    fireEvent.submit(form); fireEvent.submit(form);
    await waitFor(() => expect(spy).toHaveBeenCalledTimes(1));
  });
});
