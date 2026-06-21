import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Button from "@/components/ui/Button";

describe("Button", () => {
  it("uses the secondary (purple) style by default", () => {
    render(<Button>Enviar</Button>);

    expect(screen.getByRole("button", { name: "Enviar" })).toHaveClass("bg-secondary");
  });

  it("uses the primary (blue) style when variant is primary", () => {
    render(<Button variant="primary">Continuar</Button>);

    expect(screen.getByRole("button", { name: "Continuar" })).toHaveClass("bg-primary");
  });

  it("forwards click handlers and disabled state", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(
      <Button onClick={onClick} disabled>
        Descargar
      </Button>
    );

    const button = screen.getByRole("button", { name: "Descargar" });
    expect(button).toBeDisabled();
    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });
});
