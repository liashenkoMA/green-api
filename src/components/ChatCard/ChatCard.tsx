import styles from "./chatCard.module.scss";

interface ChatCardProps {
  number: string;
}

export default function ChatCard({ number }: ChatCardProps) {
  return (
    <button
      className={`${styles.chatCard} ${styles.chatCard_active}`}
      type="button"
    >
      <span className={styles.chatCard__avatar}></span>

      <span className={styles.chatCard__body}>
        <span className={styles.chatCard__phone}>{number}</span>
      </span>
    </button>
  );
}
