import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DocumentChat from "@/components/DocumentChat";
import { sendChatTurn } from "@/lib/chatClient";

vi.mock("@/lib/chatClient", () => ({
  sendChatTurn: vi.fn(),
}));

const mockedSendChatTurn = vi.mocked(sendChatTurn);

describe("DocumentChat", () => {
  beforeEach(() => {
    mockedSendChatTurn.mockReset();
  });

  it("shows an initial assistant greeting", () => {
    render(<DocumentChat documentId={null} values={{}} onTurn={vi.fn()} />);

    expect(screen.getByRole("log")).toHaveTextContent(/documento/i);
  });

  it("sends the typed message and renders the assistant reply", async () => {
    mockedSendChatTurn.mockResolvedValue({
      reply: "¿Qué tipo de documento necesitas?",
      documentId: null,
      values: {},
    });
    const user = userEvent.setup();
    render(<DocumentChat documentId={null} values={{}} onTurn={vi.fn()} />);

    await user.type(screen.getByRole("textbox"), "Necesito un NDA");
    await user.click(screen.getByRole("button", { name: /enviar/i }));

    expect(await screen.findByText("Necesito un NDA")).toBeInTheDocument();
    expect(await screen.findByText("¿Qué tipo de documento necesitas?")).toBeInTheDocument();
  });

  it("calls onTurn with the resolved documentId and merged values from the backend", async () => {
    mockedSendChatTurn.mockResolvedValue({
      reply: "Perfecto, un NDA mutuo.",
      documentId: "mutual-nda",
      values: { proposito: "Evaluar una alianza" },
    });
    const onTurn = vi.fn();
    const user = userEvent.setup();
    render(<DocumentChat documentId={null} values={{}} onTurn={onTurn} />);

    await user.type(screen.getByRole("textbox"), "Necesito un NDA mutuo");
    await user.click(screen.getByRole("button", { name: /enviar/i }));

    await waitFor(() =>
      expect(onTurn).toHaveBeenCalledWith({
        documentId: "mutual-nda",
        values: { proposito: "Evaluar una alianza" },
      })
    );
  });

  it("sends the current documentId and values to the backend on every turn", async () => {
    mockedSendChatTurn.mockResolvedValue({ reply: "Ok", documentId: "mutual-nda", values: {} });
    const user = userEvent.setup();
    render(
      <DocumentChat documentId="mutual-nda" values={{ proposito: "Algo" }} onTurn={vi.fn()} />
    );

    await user.type(screen.getByRole("textbox"), "hola");
    await user.click(screen.getByRole("button", { name: /enviar/i }));

    expect(mockedSendChatTurn).toHaveBeenCalledWith(
      expect.anything(),
      "mutual-nda",
      { proposito: "Algo" }
    );
  });

  it("clears the input and returns focus to it after a response", async () => {
    mockedSendChatTurn.mockResolvedValue({ reply: "Ok", documentId: null, values: {} });
    const user = userEvent.setup();
    render(<DocumentChat documentId={null} values={{}} onTurn={vi.fn()} />);

    const input = screen.getByRole("textbox");
    await user.type(input, "Hola");
    await user.click(screen.getByRole("button", { name: /enviar/i }));

    await waitFor(() => expect(input).toHaveValue(""));
    await waitFor(() => expect(input).toHaveFocus());
  });

  it("shows a fallback error message, keeps the user message, and does not call onTurn when the request fails", async () => {
    mockedSendChatTurn.mockRejectedValue(new Error("network error"));
    const onTurn = vi.fn();
    const user = userEvent.setup();
    render(<DocumentChat documentId={null} values={{}} onTurn={onTurn} />);

    await user.type(screen.getByRole("textbox"), "Hola");
    await user.click(screen.getByRole("button", { name: /enviar/i }));

    expect(await screen.findByText("Hola")).toBeInTheDocument();
    expect(await screen.findByText(/hubo un problema/i)).toBeInTheDocument();
    expect(onTurn).not.toHaveBeenCalled();
  });
});
