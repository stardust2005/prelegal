import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NdaChat from "@/components/NdaChat";
import { EMPTY_NDA_FORM_DATA } from "@/types/nda";
import { sendChatTurn } from "@/lib/chatClient";

vi.mock("@/lib/chatClient", () => ({
  sendChatTurn: vi.fn(),
}));

const mockedSendChatTurn = vi.mocked(sendChatTurn);

describe("NdaChat", () => {
  beforeEach(() => {
    mockedSendChatTurn.mockReset();
  });

  it("shows an initial assistant greeting", () => {
    render(<NdaChat values={EMPTY_NDA_FORM_DATA} onValuesChange={vi.fn()} />);

    expect(screen.getByRole("log")).toHaveTextContent(/¿qué documento|nda|confidencialidad/i);
  });

  it("sends the typed message and renders the assistant reply", async () => {
    mockedSendChatTurn.mockResolvedValue({
      reply: "¿Cómo se llama la Parte A?",
      values: EMPTY_NDA_FORM_DATA,
    });
    const user = userEvent.setup();
    render(<NdaChat values={EMPTY_NDA_FORM_DATA} onValuesChange={vi.fn()} />);

    await user.type(screen.getByRole("textbox"), "Quiero hacer un NDA");
    await user.click(screen.getByRole("button", { name: /enviar/i }));

    expect(await screen.findByText("Quiero hacer un NDA")).toBeInTheDocument();
    expect(await screen.findByText("¿Cómo se llama la Parte A?")).toBeInTheDocument();
  });

  it("calls onValuesChange with the merged values from the backend", async () => {
    const updated = { ...EMPTY_NDA_FORM_DATA, partyAName: "Acme Inc." };
    mockedSendChatTurn.mockResolvedValue({ reply: "Entendido", values: updated });
    const onValuesChange = vi.fn();
    const user = userEvent.setup();
    render(<NdaChat values={EMPTY_NDA_FORM_DATA} onValuesChange={onValuesChange} />);

    await user.type(screen.getByRole("textbox"), "La parte A es Acme Inc.");
    await user.click(screen.getByRole("button", { name: /enviar/i }));

    await waitFor(() => expect(onValuesChange).toHaveBeenCalledWith(updated));
  });

  it("clears the input after sending", async () => {
    mockedSendChatTurn.mockResolvedValue({ reply: "Ok", values: EMPTY_NDA_FORM_DATA });
    const user = userEvent.setup();
    render(<NdaChat values={EMPTY_NDA_FORM_DATA} onValuesChange={vi.fn()} />);

    const input = screen.getByRole("textbox");
    await user.type(input, "Hola");
    await user.click(screen.getByRole("button", { name: /enviar/i }));

    await waitFor(() => expect(input).toHaveValue(""));
  });

  it("shows a fallback error message and keeps the user message when the request fails", async () => {
    mockedSendChatTurn.mockRejectedValue(new Error("network error"));
    const onValuesChange = vi.fn();
    const user = userEvent.setup();
    render(<NdaChat values={EMPTY_NDA_FORM_DATA} onValuesChange={onValuesChange} />);

    await user.type(screen.getByRole("textbox"), "Hola");
    await user.click(screen.getByRole("button", { name: /enviar/i }));

    expect(await screen.findByText("Hola")).toBeInTheDocument();
    expect(await screen.findByText(/hubo un problema/i)).toBeInTheDocument();
    expect(onValuesChange).not.toHaveBeenCalled();
  });
});
