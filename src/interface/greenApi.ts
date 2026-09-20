export interface IGreenApiCredentials {
  idInstance: string;
  apiTokenInstance: string;
}

export interface IStateInstanceResponse {
  stateInstance: "authorized" | "notAuthorized" | "blocked" | "starting";
}

export interface ICheckAccountResponse {
  exist: boolean;
  chatId: string;
  fromCache: boolean;
}

export interface IGreenApiReasonResponse {
  status: false;
  reason: string;
}

export interface ISendMessageResponse {
  idMessage: string;
}

export interface INotification {
  receiptId: number;
  body: {
    typeWebhook: string;
    idMessage: string;
    senderData: {
      chatId: string;
    };
    messageData: {
      typeMessage: string;
      textMessageData?: {
        textMessage: string;
      };
    };
  };
}

export interface IDeleteNotificationResponse {
  result: boolean;
  reason: string;
}

export interface IChat {
  phoneNumber: string;
  chatId: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  type: "outgoing" | "incoming";
}
