// import Alert from "react-bootstrap/Alert";
import { Alert, AlertTitle } from "@material-ui/lab";

export const MessageAlert = ({ toggleAlert, message }) => (
  <Alert
    className="message-alert"
    severity="error"
    onClose={() => toggleAlert("")}
  >
    <AlertTitle>You got an error!</AlertTitle>
    <p>{message}</p>
  </Alert>
);
