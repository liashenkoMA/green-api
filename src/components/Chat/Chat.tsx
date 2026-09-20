import styles from "./chat.module.scss";
import { useEffect, useState } from "react";
import type { ChatMessage, IChat } from "../../interface/greenApi";
import {
  deleteNotification,
  receiveNotification,
  sendMessage,
} from "../../api/greenApi";
import useCredentials from "../../context/useCredentials";

export default function Chat({ chat }: { chat: IChat }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [textMessage, setTextMessage] = useState("");
  const { credentials } = useCredentials();

  useEffect(() => {
    if (!chat.chatId) {
      return;
    }

    function deleteNotificationFromQueue(receiptId: number) {
      deleteNotification(credentials, receiptId).catch((err) =>
        setServerError(err.message),
      );
    }

    function receiveMessage() {
      receiveNotification(credentials)
        .then((res) => {
          if (!res) {
            return;
          }

          const text = res.body.messageData?.textMessageData?.textMessage;

          if (res.body.typeWebhook === "incomingMessageReceived" && text) {
            setMessages((prev) => [
              ...prev,
              {
                id: res.body.idMessage,
                text,
                type: "incoming",
              },
            ]);
          }

          deleteNotificationFromQueue(res.receiptId);
        })
        .catch((err) => setServerError(err.message));
    }

    const interval = setInterval(receiveMessage, 6000);

    return () => clearInterval(interval);
  }, [chat.chatId, credentials]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTextMessage(e.target.value);
  }

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    if (textMessage === "") return;

    setServerError("");
    setIsLoading(true);
    const message = textMessage;

    sendMessage(credentials, chat.chatId, textMessage)
      .then((res) => {
        setMessages((prev) => [
          ...prev,
          {
            id: res.idMessage,
            text: message,
            type: "outgoing",
          },
        ]);

        setTextMessage("");
      })
      .catch((err) => setServerError(err.message))
      .finally(() => setIsLoading(false));
  }

  if (chat.chatId === "") {
    return (
      <section className={`${styles.chat} ${styles.chat_empty}`}>
        <div className={styles.chat__emptyMessage}>
          <h2 className={styles.chat__emptyTitle}>Создайте чат</h2>
          <p className={styles.chat__emptyText}>
            Создайте чат по номеру телефона, чтобы начать диалог
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.chat}>
      <header className={styles.chat__header}>
        <span className={styles.chat__avatar}></span>

        <div>
          <h2 className={styles.chat__title}>{chat.phoneNumber}</h2>
          <p className={styles.chat__status}>Чат в MAX</p>
        </div>
      </header>

      <div className={styles.chat__body}>
        {messages.length === 0 ? (
          <p className={styles.chat__noMessages}>Сообщений пока нет</p>
        ) : (
          <div className={styles.chat__messageList}>
            {messages.map((message) => (
              <div
                className={`${styles.chat__message} ${
                  message.type === "outgoing"
                    ? styles.chat__message_outgoing
                    : styles.chat__message_incoming
                }`}
                key={message.id}
              >
                {message.text}
              </div>
            ))}
          </div>
        )}

        {serverError && <p className={styles.chat__error}>{serverError}</p>}

        <form className={styles.chat__messageForm} onSubmit={handleSubmit}>
          <input
            className={styles.chat__messageInput}
            type="text"
            name="message"
            placeholder="Сообщение"
            aria-label="Текст сообщения"
            value={textMessage}
            onChange={handleChange}
          />

          <button
            className={styles.chat__sendButton}
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Отправка..." : "Отправить"}
          </button>
        </form>
      </div>
    </section>
  );
}
