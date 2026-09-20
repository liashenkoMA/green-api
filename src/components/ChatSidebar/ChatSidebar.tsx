import styles from "./chatSidebar.module.scss";
import { useState, type Dispatch, type SetStateAction } from "react";
import useCredentials from "../../context/useCredentials";
import { checkAccount } from "../../api/greenApi";
import type { IChat } from "../../interface/greenApi";
import ChatCard from "../ChatCard/ChatCard";

interface IChatSidebarProps {
  chat: IChat;
  setChat: Dispatch<SetStateAction<IChat>>;
}

export default function ChatSidebar({ chat, setChat }: IChatSidebarProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const { credentials } = useCredentials();

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    setServerError("");

    if (!phoneNumber) {
      setServerError("Введите номер телефона");
      return;
    }

    const normalizedPhone = phoneNumber.replace(/\D/g, "");

    setIsLoading(true);

    checkAccount(credentials, Number(normalizedPhone))
      .then((result) => {
        if (!result.exist) {
          setServerError("Пользователь MAX не найден");
          return;
        }

        setChat({ phoneNumber: normalizedPhone, chatId: result.chatId });
        setPhoneNumber("");
      })
      .catch((err) => setServerError(err.message))
      .finally(() => setIsLoading(false));
  }

  return (
    <aside className={styles.chatSidebar}>
      <header className={styles.chatSidebar__header}>
        <h1 className={styles.chatSidebar__title}>Чаты</h1>
        <p className={styles.chatSidebar__subtitle}>GREEN-API для MAX</p>
      </header>

      <form className={styles.chatSidebar__form} onSubmit={handleSubmit}>
        <label className={styles.chatSidebar__field}>
          <span className={styles.chatSidebar__label}>Номер телефона</span>
          <input
            className={styles.chatSidebar__input}
            type="tel"
            inputMode="numeric"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="79991234567"
          />
        </label>

        {serverError && (
          <p className={styles.chatSidebar__error}>{serverError}</p>
        )}

        <button
          className={styles.chatSidebar__button}
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Проверка..." : "Создать чат"}
        </button>
      </form>

      {chat.chatId && <ChatCard number={chat.phoneNumber} />}
    </aside>
  );
}
