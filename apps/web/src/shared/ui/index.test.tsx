import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Advisory, Button, Field, Modal, Timeline } from "./index";

describe("shared UI", () => {
  it("renders semantic controls and labels", async () => {
    const click = vi.fn();
    const user = userEvent.setup();
    render(
      <>
        <Field label="Email" required hint="Work address">
          <input />
        </Field>
        <Button onClick={click}>Save</Button>
      </>,
    );
    expect(screen.getByText("Work address")).toBeInTheDocument();
    expect(screen.getByLabelText("required")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(click).toHaveBeenCalledOnce();
  });

  it("honors disabled controls and closes a dialog from Escape", async () => {
    const close = vi.fn();
    const user = userEvent.setup();
    render(
      <>
        <Button disabled>Disabled</Button>
        <Modal title="Keyboard" onClose={close}>
          <p>Body</p>
        </Modal>
        <Timeline items={[]} />
        <Advisory>Fallback</Advisory>
      </>,
    );
    expect(screen.getByRole("button", { name: "Disabled" })).toBeDisabled();
    await user.keyboard("{Escape}");
    expect(close).toHaveBeenCalledOnce();
    expect(document.querySelector(".timeline")?.childElementCount).toBe(0);
  });

  it("closes modal and renders timeline/advisory content", async () => {
    const close = vi.fn();
    const refresh = vi.fn();
    const user = userEvent.setup();
    render(
      <>
        <Modal title="Confirm" onClose={close}>
          <p>Body</p>
        </Modal>
        <Timeline
          items={[{ title: "Submitted", meta: "Today", note: "Done" }]}
        />
        <Advisory onRefresh={refresh}>Suggestion</Advisory>
      </>,
    );
    await user.click(screen.getByRole("button", { name: "Close dialog" }));
    await user.click(screen.getByRole("button", { name: "Refresh" }));
    expect(close).toHaveBeenCalledOnce();
    expect(refresh).toHaveBeenCalledOnce();
    expect(screen.getByText("Submitted")).toBeInTheDocument();
    expect(screen.getByText("Suggestion")).toBeInTheDocument();
  });
});
