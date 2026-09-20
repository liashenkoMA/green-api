import AuthForm from "./AuthForm";
import { getStateInstance } from "../../api/greenApi";
import useCredentials from "../../context/useCredentials";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";

vi.mock("../../api/greenApi", () => ({
  getStateInstance: vi.fn(),
}));

vi.mock("../../context/useCredentials", () => ({
  default: vi.fn(),
}));

const mockUseCredentials = vi.mocked(useCredentials);

describe("Auth Form component", () => {
  const setCredentials = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseCredentials.mockReturnValue({
      credentials: {
        idInstance: "",
        apiTokenInstance: "",
      },
      setCredentials,
    });
  });

  function fillForm() {
    fireEvent.change(screen.getByPlaceholderText("Введите idInstance"), {
      target: {
        value: "123456789",
      },
    });

    fireEvent.change(screen.getByPlaceholderText("Введите apiTokenInstance"), {
      target: {
        value: "test-token",
      },
    });
  }

  it("Рендер всех полей", () => {
    render(<AuthForm />);

    expect(
      screen.getByPlaceholderText("Введите idInstance"),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Введите apiTokenInstance"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "Подключиться",
      }),
    ).toBeInTheDocument();
  });

  it("Ввод данных работает", () => {
    render(<AuthForm />);

    const input = screen.getByPlaceholderText("Введите idInstance");

    fireEvent.change(input, {
      target: {
        value: "123456789",
      },
    });

    expect(input).toHaveValue("123456789");
  });

  it("Показывает ошибку при пустых полях", () => {
    render(<AuthForm />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Подключиться",
      }),
    );

    expect(screen.getByText("Заполните все поля")).toBeInTheDocument();
    expect(getStateInstance).not.toHaveBeenCalled();
    expect(setCredentials).not.toHaveBeenCalled();
  });

  it("Показывает ошибку если инстанс не авторизован", async () => {
    (getStateInstance as Mock).mockResolvedValueOnce({
      stateInstance: "notAuthorized",
    });

    render(<AuthForm />);

    fillForm();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Подключиться",
      }),
    );

    expect(
      await screen.findByText("Инстанс не авторизован: notAuthorized"),
    ).toBeInTheDocument();
    expect(setCredentials).not.toHaveBeenCalled();
  });

  it("Ошибка сервера отображается", async () => {
    (getStateInstance as Mock).mockRejectedValueOnce(
      new Error("Ошибка сервера"),
    );

    render(<AuthForm />);

    fillForm();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Подключиться",
      }),
    );

    expect(await screen.findByText("Ошибка сервера")).toBeInTheDocument();
    expect(setCredentials).not.toHaveBeenCalled();
  });

  it("Показывает загрузку при отправке формы", () => {
    (getStateInstance as Mock).mockReturnValueOnce(new Promise(() => {}));

    render(<AuthForm />);

    fillForm();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Подключиться",
      }),
    );

    expect(
      screen.getByRole("button", {
        name: "Подключение...",
      }),
    ).toBeDisabled();
  });

  it("Успешное подключение", async () => {
    (getStateInstance as Mock).mockResolvedValueOnce({
      stateInstance: "authorized",
    });

    render(<AuthForm />);

    fillForm();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Подключиться",
      }),
    );

    expect(getStateInstance).toHaveBeenCalledWith({
      idInstance: "123456789",
      apiTokenInstance: "test-token",
    });
    await waitFor(() => {
      expect(setCredentials).toHaveBeenCalledWith({
        idInstance: "123456789",
        apiTokenInstance: "test-token",
      });
    });
  });

  it("Snapshot", () => {
    const { container } = render(<AuthForm />);

    expect(container).toMatchSnapshot();
  });
});
