import styles from "./authForm.module.scss";
import { useState } from "react";
import type { IGreenApiCredentials } from "../../interface/greenApi";
import { getStateInstance } from "../../api/greenApi";
import useCredentials from "../../context/useCredentials";

const initialState: IGreenApiCredentials = {
  idInstance: "",
  apiTokenInstance: "",
};

export default function AuthForm() {
  const [formData, setFormData] = useState<IGreenApiCredentials>(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const { setCredentials } = useCredentials();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    setServerError("");

    if (!formData.idInstance || !formData.apiTokenInstance) {
      setServerError("Заполните все поля");
      return;
    }

    setIsLoading(true);

    getStateInstance(formData)
      .then((result) => {
        if (result.stateInstance !== "authorized") {
          setServerError(`Инстанс не авторизован: ${result.stateInstance}`);
          return;
        }

        setCredentials(formData);
      })
      .catch((err) => setServerError(err.message))
      .finally(() => setIsLoading(false));
  }

  return (
    <main className={styles.auth}>
      <form className={styles.auth__form} onSubmit={handleSubmit}>
        <div className={styles.auth__header}>
          <h1 className={styles.auth__title}>MAX Chat</h1>

          <p className={styles.auth__description}>
            Введите данные вашего инстанса GREEN-API
          </p>
        </div>

        <div className={styles.auth__fields}>
          <label className={styles.auth__field}>
            <span className={styles.auth__label}>idInstance</span>

            <input
              className={styles.auth__input}
              type="text"
              name="idInstance"
              value={formData.idInstance}
              onChange={handleChange}
              placeholder="Введите idInstance"
            />
          </label>

          <label className={styles.auth__field}>
            <span className={styles.auth__label}>apiTokenInstance</span>

            <input
              className={styles.auth__input}
              type="password"
              name="apiTokenInstance"
              value={formData.apiTokenInstance}
              onChange={handleChange}
              placeholder="Введите apiTokenInstance"
            />
          </label>
        </div>

        {serverError && <p className={styles.auth__error}>{serverError}</p>}

        <button
          className={styles.auth__button}
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Подключение..." : "Подключиться"}
        </button>
      </form>
    </main>
  );
}
