import { Slide, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { TOAST_LIFETIME } from "./toastMeta";
import "./toast.css";

// The container owns queueing, auto-dismiss, pause, and the live region. The
// visual body is the Forever editorial card rendered by the toast facade.
const ToastViewport = () => (
  <ToastContainer
    position="bottom-left"
    autoClose={TOAST_LIFETIME}
    newestOnTop={false}
    closeOnClick={false}
    closeButton={false}
    icon={false}
    draggable={false}
    pauseOnFocusLoss={false}
    pauseOnHover
    limit={3}
    stacked={false}
    transition={Slide}
    theme="light"
    ariaLabel="Notifications"
    className="forever-toast-container"
    toastClassName="forever-toast-shell"
    bodyClassName="forever-toast-body"
  />
);

export default ToastViewport;
