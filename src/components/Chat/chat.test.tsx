import Chat from "./Chat";
import {
  deleteNotification,
  receiveNotification,
  sendMessage,
} from "../../api/greenApi";
import useCredentials from "../../context/useCredentials";
import type { IChat } from "../../interface/greenApi";
import { act, fireEvent, render, screen } from "@testing-library/react";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type Mock,
  vi,
} from "vitest";

vi.mock("../../api/greenApi", () => ({
  deleteNotification: vi.fn(),
  receiveNotification: vi.fn(),
  sendMessage: vi.fn(),
}));

vi.mock("../../context/useCredentials", () => ({
  default: vi.fn(),
}));

const mockUseCredentials = vi.mocked(useCredentials);

const emptyChat: IChat = {
  phoneNumber: "",
  chatId: "",
};

const activeChat: IChat = {
  phoneNumber: "79991234567",
  chatId: "468449051",
};

describe("Chat component", () => {
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

    (receiveNotification as Mock).mockResolvedValue(null);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function fillMessage() {
    fireEvent.change(screen.getByPlaceholderText("Сообщение"), {
      target: {
        value: "Привет",
      },
    });
  }

  it("Рендер пустого чата", () => {
    render(<Chat chat={emptyChat} />);

    expect(screen.getByText("Создайте чат")).toBeInTheDocument();
    expect(receiveNotification).not.toHaveBeenCalled();
  });

  it("Рендер активного чата", () => {
    render(<Chat chat={activeChat} />);

    expect(screen.getByText("79991234567")).toBeInTheDocument();
    expect(screen.getByText("Сообщений пока нет")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Сообщение")).toBeInTheDocument();
  });

  it("Ввод сообщения работает", () => {
    render(<Chat chat={activeChat} />);

    const input = screen.getByPlaceholderText("Сообщение");

    fillMessage();

    expect(input).toHaveValue("Привет");
  });

  it("Пустое сообщение не отправляется", () => {
    render(<Chat chat={activeChat} />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Отправить",
      }),
    );

    expect(sendMessage).not.toHaveBeenCalled();
  });

  it("Показывает загрузку при отправке сообщения", () => {
    (sendMessage as Mock).mockReturnValueOnce(new Promise(() => {}));

    render(<Chat chat={activeChat} />);

    fillMessage();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Отправить",
      }),
    );

    expect(
      screen.getByRole("button", {
        name: "Отправка...",
      }),
    ).toBeDisabled();
  });

  it("Успешная отправка сообщения", async () => {
    (sendMessage as Mock).mockResolvedValueOnce({
      idMessage: "message-1",
    });

    render(<Chat chat={activeChat} />);

    fillMessage();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Отправить",
      }),
    );

    expect(sendMessage).toHaveBeenCalledWith(
      credentials,
      activeChat.chatId,
      "Привет",
    );
    expect(await screen.findByText("Привет")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Сообщение")).toHaveValue("");
  });

  it("Ошибка отправки отображается", async () => {
    (sendMessage as Mock).mockRejectedValueOnce(new Error("Ошибка отправки"));

    render(<Chat chat={activeChat} />);

    fillMessage();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Отправить",
      }),
    );

    expect(await screen.findByText("Ошибка отправки")).toBeInTheDocument();
  });

  it("Получение входящего сообщения", async () => {
    vi.useFakeTimers();

    (receiveNotification as Mock).mockResolvedValueOnce({
      receiptId: 123,
      body: {
        typeWebhook: "incomingMessageReceived",
        idMessage: "message-2",
        senderData: {
          chatId: activeChat.chatId,
        },
        messageData: {
          typeMessage: "textMessage",
          textMessageData: {
            textMessage: "Ответ",
          },
        },
      },
    });

    render(<Chat chat={activeChat} />);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(6000);
    });

    expect(screen.getByText("Ответ")).toBeInTheDocument();
    expect(deleteNotification).toHaveBeenCalledWith(credentials, 123);
  });

  it("Snapshot", () => {
    const { container } = render(<Chat chat={emptyChat} />);

    expect(container).toMatchSnapshot();
  });
});
