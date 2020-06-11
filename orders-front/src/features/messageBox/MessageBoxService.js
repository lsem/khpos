import * as React from "react";
import MessageBox from "./MessageBox";

const MessageBoxServiceContext = React.createContext(Promise.reject);

export const useMessageBox = () => React.useContext(MessageBoxServiceContext);

export const MessageBoxServiceProvider = ({ children }) => {
  const [messageBoxState, setMessageBoxState] = React.useState(null);

  const [open, setOpen] = React.useState(false);

  const awaitingPromiseRef = React.useRef();

  const openMessageBox = (options) => {
    setMessageBoxState(options);
    setOpen(true);
    return new Promise((resolve, reject) => {
      awaitingPromiseRef.current = { resolve, reject };
    });
  };

  const handleClose = () => {
    if (messageBoxState.catchOnCancel && awaitingPromiseRef.current) {
      awaitingPromiseRef.current.reject();
    }
    setOpen(false);
  };

  const handleSubmit = () => {
    if (awaitingPromiseRef.current) {
      awaitingPromiseRef.current.resolve();
    }
    setOpen(false);
  };

  const handleClosed = () => {
    setMessageBoxState(null);
  };

  return (
    <>
      <MessageBoxServiceContext.Provider
        value={openMessageBox}
        children={children}
      />

      <MessageBox
        open={open}
        onSubmit={handleSubmit}
        onClose={handleClose}
        onClosed={handleClosed}
        {...messageBoxState}
      />
    </>
  );
};
