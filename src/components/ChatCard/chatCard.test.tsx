import ChatCard from "./ChatCard";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("Chat Card component", () => {
  it("Рендер номера телефона", () => {
    render(<ChatCard number="79991234567" />);

    expect(
      screen.getByRole("button", {
        name: "79991234567",
      }),
    ).toBeInTheDocument();
  });

  it("Snapshot", () => {
    const { container } = render(<ChatCard number="79991234567" />);

    expect(container).toMatchSnapshot();
  });
});
