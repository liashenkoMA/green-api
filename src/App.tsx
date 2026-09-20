import AuthForm from "./components/AuthForm/AuthForm";
import ChatPage from "./components/ChatPage/ChatPage";
import useCredentials from "./context/useCredentials";

function App() {
  const { credentials } = useCredentials();

  if (!credentials.idInstance || !credentials.apiTokenInstance) {
    return <AuthForm />;
  }

  return <ChatPage />;
}

export default App;
