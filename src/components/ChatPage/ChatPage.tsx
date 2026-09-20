import styles from "./chatPage.module.scss";
import Chat from "../Chat/Chat";
import ChatSidebar from "../ChatSidebar/ChatSidebar";
import { useState } from "react";
import type { IChat } from "../../interface/greenApi";

export default function ChatPage() {
  const [chat, setChat] = useState<IChat>({
    phoneNumber: "",
    chatId: "",
  });

  return (
    <main className={styles.chatPage}>
      <ChatSidebar chat={chat} setChat={setChat} />
      <Chat key={chat.chatId} chat={chat} />
    </main>
  );
}
