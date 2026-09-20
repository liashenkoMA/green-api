import ChatSidebar from "./ChatSidebar";
import { checkAccount } from "../../api/greenApi";
import useCredentials from "../../context/useCredentials";
import type { IChat } from "../../interface/greenApi";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";

vi.mock("../../api/greenApi", () => ({
  checkAccount: vi.fn(),
}));

vi.mock("../../context/useCredentials", () => ({
  default: vi.fn(),
}));

const mockUseCredentials = vi.mocked(useCredentials);

const emptyChat: IChat = {
  phoneNumber: "",
  chatId: "",
};

describe("Chat Sidebar component", () => {
  const setChat = vi.fn();
  const credentials = {
    idInstance: "123456789",
    apiTokenInstance: "test-token",
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseCredentials.mockReturnValue({
      credentials,
      setCredentials: vi.fn(),
    });
  });

  function renderComponent(chat = emptyChat) {
    render(<ChatSidebar chat={chat} setChat={setChat} />);
  }

  function fillPhoneNumber() {
    fireEvent.change(screen.getByPlaceholderText("79991234567"), {
      target: {
        value: "79991234567",
      },
    });
  }

  it("Рендер формы", () => {
    renderComponent();

    expect(screen.getByPlaceholderText("79991234567")).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "Создать чат",
      }),
    ).toBeInTheDocument();
  });

  it("Ввод номера телефона работает", () => {
    renderComponent();

    const input = screen.getByPlaceholderText("79991234567");

    fillPhoneNumber();

    expect(input).toHaveValue("79991234567");
  });

  it("Показывает ошибку при пустом поле", () => {
    renderComponent();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Создать чат",
      }),
    );

    expect(screen.getByText("Введите номер телефона")).toBeInTheDocument();
    expect(checkAccount).not.toHaveBeenCalled();
    expect(setChat).not.toHaveBeenCalled();
  });

  it("Показывает ошибку если пользователь не найден", async () => {
    (checkAccount as Mock).mockResolvedValueOnce({
      exist: false,
      chatId: "",
      fromCache: false,
    });

    renderComponent();

    fillPhoneNumber();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Создать чат",
      }),
    );

    expect(
      await screen.findByText("Пользователь MAX не найден"),
    ).toBeInTheDocument();
    expect(setChat).not.toHaveBeenCalled();
  });

  it("Ошибка сервера отображается", async () => {
    (checkAccount as Mock).mockRejectedValueOnce(new Error("Ошибка сервера"));

    renderComponent();

    fillPhoneNumber();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Создать чат",
      }),
    );

    expect(await screen.findByText("Ошибка сервера")).toBeInTheDocument();
    expect(setChat).not.toHaveBeenCalled();
  });

  it("Показывает загрузку при отправке формы", () => {
    (checkAccount as Mock).mockReturnValueOnce(new Promise(() => {}));

    renderComponent();

    fillPhoneNumber();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Создать чат",
      }),
    );

    expect(
      screen.getByRole("button", {
        name: "Проверка...",
      }),
    ).toBeDisabled();
  });

  it("Успешное создание чата", async () => {
    (checkAccount as Mock).mockResolvedValueOnce({
      exist: true,
      chatId: "468449051",
      fromCache: false,
    });

    renderComponent();

    fillPhoneNumber();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Создать чат",
      }),
    );

    expect(checkAccount).toHaveBeenCalledWith(credentials, 79991234567);
    await waitFor(() => {
      expect(setChat).toHaveBeenCalledWith({
        phoneNumber: "79991234567",
        chatId: "468449051",
      });
    });
  });

  it("Рендер карточки созданного чата", () => {
    renderComponent({
      phoneNumber: "79991234567",
      chatId: "468449051",
    });

    expect(
      screen.getByRole("button", {
        name: "79991234567",
      }),
    ).toBeInTheDocument();
  });

  it("Snapshot", () => {
    const { container } = render(
      <ChatSidebar chat={emptyChat} setChat={setChat} />,
    );

    expect(container).toMatchSnapshot();
  });
});
