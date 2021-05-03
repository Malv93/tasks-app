import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import Button from "@material-ui/core/Button";
import { Link, useHistory } from "react-router-dom";

export const SignInPage = ({ toggleAlert, storeData }) => {
  const history = useHistory();

  return (
    <div className="page-content">
      <Formik
        initialValues={{ email: "", password: "" }}
        validationSchema={Yup.object({
          email: Yup.string()
            .email("Please enter a valid email address")
            .max(50, "Email address is too long")
            .required("Please enter your email"),
          password: Yup.string().required("Please enter your password"),
        })}
        onSubmit={async ({ email, password }, { setSubmitting, resetForm }) => {
          try {
            const myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");

            // TODO: try to destructure values in arguments
            const raw = JSON.stringify({
              email,
              password,
            });

            const requestOptions = {
              method: "POST",
              headers: myHeaders,
              body: raw,
            };

            const response = await fetch("/api/users/login", requestOptions);
            if (response.status !== 200) {
              const error = "There was a problem and Sign in failed.";
              throw new Error(error);
            }

            const result = await response.json();

            // Store token, user data and set authed to true
            storeData(result);
            // Go to user tasks page
            history.push("/user/tasks");
          } catch (err) {
            toggleAlert("Sign in failed. Try with another email or password.");
            console.log(err); //debug,
          } finally {
            resetForm({});
            setSubmitting(false);
          }
        }}
      >
        {(props) => (
          <Form className="signing-form">
            <h1>Sign in</h1>
            <Field name="email" type="email" placeholder="Email" />
            <div className="error-message">
              <ErrorMessage name="email" />
            </div>

            <Field name="password" type="password" placeholder="Password" />
            <div className="error-message">
              <ErrorMessage name="password" />
            </div>
            <Button variant="contained" type="submit">
              Sign In
            </Button>
            <p>
              Don't have an account? <Link to="/">Sign Up</Link>
            </p>
          </Form>
        )}
      </Formik>
    </div>
  );
};
