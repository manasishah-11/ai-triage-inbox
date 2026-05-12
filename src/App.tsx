import { Navigate, Outlet, createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import Inbox from "@pages/inbox";
import ThemeToggle from "@components/common/ThemeToggle";
import InboxDetails from "@pages/inbox_msg_details";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/inbox" replace />,
  },
  {
    path: "/inbox",
    element: <Outlet />,
    children: [
      { index: true, element: <Inbox /> },
      { path: ":messageId", element: <InboxDetails /> },
    ],
  },
]);

function App() {
  return (
    <>
      <div className="fixed top-4 right-4 z-20">
        <ThemeToggle />
      </div>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
