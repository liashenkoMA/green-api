import type {
  ICheckAccountResponse,
  IDeleteNotificationResponse,
  IGreenApiCredentials,
  IGreenApiReasonResponse,
  INotification,
  ISendMessageResponse,
  IStateInstanceResponse,
} from "../interface/greenApi";

const apiUrl = "https://3100.api.green-api.com";

export async function getStateInstance(
  credentials: IGreenApiCredentials,
): Promise<IStateInstanceResponse> {
  const { idInstance, apiTokenInstance } = credentials;

  const res = await fetch(
    `${apiUrl}/waInstance${idInstance}/getStateInstance/${apiTokenInstance}`,
  );

  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}`);
  }

  const result: IStateInstanceResponse = await res.json();

  return result;
}

export async function checkAccount(
  credentials: IGreenApiCredentials,
  phoneNumber: number,
): Promise<ICheckAccountResponse> {
  const { idInstance, apiTokenInstance } = credentials;

  const res = await fetch(
    `${apiUrl}/waInstance${idInstance}/checkAccount/${apiTokenInstance}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phoneNumber,
      }),
    },
  );

  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}`);
  }

  const result: ICheckAccountResponse | IGreenApiReasonResponse =
    await res.json();

  if ("status" in result) {
    throw new Error(result.reason);
  }

  return result;
}

export async function sendMessage(
  credentials: IGreenApiCredentials,
  chatId: string,
  message: string,
): Promise<ISendMessageResponse> {
  const { idInstance, apiTokenInstance } = credentials;

  const res = await fetch(
    `${apiUrl}/waInstance${idInstance}/sendMessage/${apiTokenInstance}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chatId,
        message,
      }),
    },
  );

  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}`);
  }

  const result: ISendMessageResponse = await res.json();

  return result;
}

export async function receiveNotification(
  credentials: IGreenApiCredentials,
): Promise<INotification | null> {
  const { idInstance, apiTokenInstance } = credentials;

  const res = await fetch(
    `${apiUrl}/waInstance${idInstance}/receiveNotification/${apiTokenInstance}?receiveTimeout=5`,
  );

  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}`);
  }

  const text = await res.text();

  if (!text) {
    return null;
  }

  const result: INotification = JSON.parse(text);

  return result;
}

export async function deleteNotification(
  credentials: IGreenApiCredentials,
  receiptId: number,
): Promise<IDeleteNotificationResponse> {
  const { idInstance, apiTokenInstance } = credentials;

  const res = await fetch(
    `${apiUrl}/waInstance${idInstance}/deleteNotification/${apiTokenInstance}/${receiptId}`,
    {
      method: "DELETE",
    },
  );

  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}`);
  }

  const result: IDeleteNotificationResponse = await res.json();

  if (!result.result) {
    throw new Error(result.reason);
  }

  return result;
}
