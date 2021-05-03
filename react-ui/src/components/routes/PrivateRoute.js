import { Route, Redirect } from "react-router-dom";

/* Protect a route with authentication (authed = true) */
// Pass the props using ...rest to the Component
// The argument props in the render callback seems to pass
// Route "props" (history, match) to Component
// while rest contains also computedmatch and location

export const PrivateRoute = ({ component: Component, authed, ...rest }) => (
  <Route
    {...rest}
    render={(props) =>
      authed === true ? (
        <Component {...props} {...rest} />
      ) : (
        <Redirect to={{ pathname: "/", state: { from: props.location } }} />
      )
    }
  />
);
