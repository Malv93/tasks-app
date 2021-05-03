import { Link } from "react-router-dom";

export const Header = ({ signOut, authed, name }) => {
  return (
    <header>
      <h3>Task-App</h3>
      {authed && (
        <div>
          {/* <span>
            <AccountCircleRoundedIcon /> {name}
          </span> */}
          <Link to="/" onClick={signOut}>
            Log Out
          </Link>
        </div>
      )}
    </header>
  );
};
