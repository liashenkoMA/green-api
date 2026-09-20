import {
  checkAccount,
  deleteNotification,
  getStateInstance,
  receiveNotification,
  sendMessage,
} from "./greenApi";
import type {
  ICheckAccountResponse,
  IDeleteNotificationResponse,
  IGreenApiCredentials,
  INotification,
  ISendMessageResponse,
  IStateInstanceResponse,
} from "../interface/greenApi";
import {
  beforeEach,
  describe,
  expect,
  it,
  type MockedFunction,
  vi,
} from "vitest";

globalThis.fetch = vi.fn();

describe("Green API", () => {
  const mockFetch = fetch as MockedFunction<typeof fetch>;

  const apiUrl = "https://3100.api.green-api.com";

  const mockCredentials: IGreenApiCredentials = {
    idInstance: "123456789",
    apiTokenInstance: "test-token",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getStateInstance", () => {
    it("Ошибка сети при получении состояния инстанса", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getStateInstance(mockCredentials)).rejects.toThrow(
        "Network Error",
      );
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it("Успешное получение состояния инстанса", async () => {
      const mockResponse: IStateInstanceResponse = {
        stateInstance: "authorized",
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result: IStateInstanceResponse =
        await getStateInstance(mockCredentials);

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        `${apiUrl}/waInstance${mockCredentials.idInstance}/getStateInstance/${mockCredentials.apiTokenInstance}`,
      );
    });

    it("Сервер вернул !res.ok", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
      } as Response);

      await expect(getStateInstance(mockCredentials)).rejects.toThrow(
        "401 Unauthorized",
      );
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe("checkAccount", () => {
    it("Ошибка сети при проверке аккаунта", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network Error"));

      await expect(checkAccount(mockCredentials, 79991234567)).rejects.toThrow(
        "Network Error",
      );
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it("Успешная проверка аккаунта", async () => {
      const mockResponse: ICheckAccountResponse = {
        exist: true,
        chatId: "468449051",
        fromCache: true,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result: ICheckAccountResponse = await checkAccount(
        mockCredentials,
        79991234567,
      );

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        `${apiUrl}/waInstance${mockCredentials.idInstance}/checkAccount/${mockCredentials.apiTokenInstance}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phoneNumber: 79991234567,
          }),
        },
      );
    });

    it("Возвращает exist false, если аккаунт не найден", async () => {
      const mockResponse: ICheckAccountResponse = {
        exist: false,
        chatId: "",
        fromCache: false,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result: ICheckAccountResponse = await checkAccount(
        mockCredentials,
        79991234567,
      );

      expect(result).toEqual(mockResponse);
      expect(result.exist).toBe(false);
    });

    it("Сервер вернул !res.ok", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: "Bad Request",
      } as Response);

      await expect(checkAccount(mockCredentials, 123)).rejects.toThrow(
        "400 Bad Request",
      );
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it("GREEN-API вернул status false", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: false,
          reason: "User get contact info limit reached",
        }),
      } as Response);

      await expect(checkAccount(mockCredentials, 79991234567)).rejects.toThrow(
        "User get contact info limit reached",
      );
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe("sendMessage", () => {
    it("Ошибка сети при отправке сообщения", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network Error"));

      await expect(
        sendMessage(mockCredentials, "468449051", "Привет"),
      ).rejects.toThrow("Network Error");
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it("Успешная отправка сообщения", async () => {
      const mockResponse: ISendMessageResponse = {
        idMessage: "123456789",
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result: ISendMessageResponse = await sendMessage(
        mockCredentials,
        "468449051",
        "Привет",
      );

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        `${apiUrl}/waInstance${mockCredentials.idInstance}/sendMessage/${mockCredentials.apiTokenInstance}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chatId: "468449051",
            message: "Привет",
          }),
        },
      );
    });

    it("Сервер вернул !res.ok", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: "Bad Request",
      } as Response);

      await expect(sendMessage(mockCredentials, "", "Привет")).rejects.toThrow(
        "400 Bad Request",
      );
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe("receiveNotification", () => {
    it("Ошибка сети при получении уведомления", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network Error"));

      await expect(receiveNotification(mockCredentials)).rejects.toThrow(
        "Network Error",
      );
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it("Успешное получение уведомления", async () => {
      const mockNotification: INotification = {
        receiptId: 123,
        body: {
          typeWebhook: "incomingMessageReceived",
          idMessage: "message-1",
          senderData: {
            chatId: "468449051",
          },
          messageData: {
            typeMessage: "textMessage",
            textMessageData: {
              textMessage: "Привет",
            },
          },
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify(mockNotification),
      } as Response);

      const result: INotification | null =
        await receiveNotification(mockCredentials);

      expect(result).toEqual(mockNotification);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        `${apiUrl}/waInstance${mockCredentials.idInstance}/receiveNotification/${mockCredentials.apiTokenInstance}?receiveTimeout=5`,
      );
    });

    it("Возвращает null, если уведомлений нет", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => "",
      } as Response);

      const result: INotification | null =
        await receiveNotification(mockCredentials);

      expect(result).toBeNull();
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it("Сервер вернул !res.ok", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
      } as Response);

      await expect(receiveNotification(mockCredentials)).rejects.toThrow(
        "401 Unauthorized",
      );
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe("deleteNotification", () => {
    it("Ошибка сети при удалении уведомления", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network Error"));

      await expect(deleteNotification(mockCredentials, 123)).rejects.toThrow(
        "Network Error",
      );
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it("Успешное удаление уведомления", async () => {
      const mockResponse: IDeleteNotificationResponse = {
        result: true,
        reason: "",
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result: IDeleteNotificationResponse = await deleteNotification(
        mockCredentials,
        123,
      );

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        `${apiUrl}/waInstance${mockCredentials.idInstance}/deleteNotification/${mockCredentials.apiTokenInstance}/123`,
        {
          method: "DELETE",
        },
      );
    });

    it("Сервер вернул !res.ok", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: "Bad Request",
      } as Response);

      await expect(deleteNotification(mockCredentials, 123)).rejects.toThrow(
        "400 Bad Request",
      );
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it("GREEN-API вернул result false", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          result: false,
          reason: "Notification not found",
        }),
      } as Response);

      await expect(deleteNotification(mockCredentials, 123)).rejects.toThrow(
        "Notification not found",
      );
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });
});
