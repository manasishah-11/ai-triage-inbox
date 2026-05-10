import Inbox from "@pages/inbox";
import ThemeToggle from "@components/common/ThemeToggle";

function App() {
  return (
    <div className="relative">
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>
      <Inbox />
    </div>
  );
}

export default App;
