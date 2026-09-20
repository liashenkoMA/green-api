import ChatPage from "./ChatPage";
import type { IChat } from "../../interface/greenApi";
import type { Dispatch, SetStateAction } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("../ChatSidebar/ChatSidebar", () => ({
  default: ({
    chat,
    setChat,
  }: {
    chat: IChat;
    setChat: Dispatch<SetStateAction<IChat>>;
  }) => (
    <div>
      <span>Сайдбар: {chat.chatId || "пусто"}</span>
      <button
        type="button"
        onClick={() =>
          setChat({
            phoneNumber: "79991234567",
            chatId: "468449051",
          })
        }
      >
        Создать тестовый чат
      </button>
    </div>
  ),
}));

vi.mock("../Chat/Chat", () => ({
  default: ({ chat }: { chat: IChat }) => (
    <div>Чат: {chat.chatId || "пусто"}</div>
  ),
}));

describe("Chat Page component", () => {
  it("Рендер начального состояния", () => {
    render(<ChatPage />);

    expect(screen.getByText("Сайдбар: пусто")).toBeInTheDocument();
    expect(screen.getByText("Чат: пусто")).toBeInTheDocument();
  });

  it("Обновляет активный чат", () => {
    render(<ChatPage />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Создать тестовый чат",
      }),
    );

    expect(screen.getByText("Сайдбар: 468449051")).toBeInTheDocument();
    expect(screen.getByText("Чат: 468449051")).toBeInTheDocument();
  });

  it("Snapshot", () => {
    const { container } = render(<ChatPage />);

    expect(container).toMatchSnapshot();
  });
});
