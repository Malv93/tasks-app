import React, { useState } from "react";
import { Switch, Route } from "react-router-dom";
import { PrivateRoute } from "./components/routes/PrivateRoute";
import { SignUpPage } from "./components/pages/SignUpPage";
import { SignInPage } from "./components/pages/SignInPage";
import { UserPage } from "./components/pages/UserPage";
import { MessageAlert } from "./components/MessageAlert";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";

export const App = () => {
  const [appState, setAppState] = useState({
    message: "",
    showAlert: false,
    authed: false,
    token: "",
    name: "",
  });

  //Store in state token, user data and set authed=true
  const storeData = (result) => {
    setAppState((prevState) => ({
      ...prevState,
      authed: true,
      token: result.token,
      name: result.user.name,
    }));
  };

  const signOut = async () => {
    try {
      const myHeaders = new Headers();
      myHeaders.append("Authorization", `Bearer ${appState.token}`);

      const requestOptions = {
        method: "POST",
        headers: myHeaders,
      };

      const response = await fetch("/api/users/logout", requestOptions);
      if (response.status !== 200) {
        const err = "There was a Problem, and logout failed.";

        throw new Error(err);
      }
      // logout the user
      setAppState((prevState) => ({
        ...prevState,
        authed: false,
        tasks: [],
        token: "",
        name: "",
      }));
      console.log("Signout successfully");
    } catch (err) {
      toggleAlert("SIgn out failed, please contact the assistance.");
      console.log(err);
    }
  };

  //Toggle the message Alert
  const toggleAlert = (message) => {
    setAppState((prevState) => ({
      ...prevState,
      message,
      showAlert: !prevState.showAlert,
    }));
  };

  return (
    <div className="App">
      <Header signOut={signOut} authed={appState.authed} name={appState.name} />

      <main className="main-content">
        {appState.showAlert && (
          <MessageAlert toggleAlert={toggleAlert} message={appState.message} />
        )}
        <Switch>
          <PrivateRoute
            authed={appState.authed}
            path="/user/tasks"
            component={UserPage}
            //passed to Component as props
            token={appState.token}
            toggleAlert={toggleAlert}
          />
          <Route path="/signin">
            <SignInPage storeData={storeData} toggleAlert={toggleAlert} />
          </Route>
          <Route path="/">
            <SignUpPage storeData={storeData} toggleAlert={toggleAlert} />
          </Route>
        </Switch>
      </main>
      <Footer />
    </div>
  );
};
