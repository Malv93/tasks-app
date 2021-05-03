import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import Button from "@material-ui/core/Button";
import { Link, useHistory } from "react-router-dom";

export const SignUpPage = ({ toggleAlert, storeData }) => {
  const history = useHistory();

  return (
    <div className="page-content">
      <Formik
        initialValues={{
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
        }}
        validationSchema={Yup.object({
          name: Yup.string()
            .max(30, "Name is too long")
            .required("Required field"),
          email: Yup.string()
            .email("Please enter a valid email address")
            .max(50, "Email address is too long")
            .required("Required field"),
          password: Yup.string()
            .required("Please enter your password")
            .matches(
              /^.*(?=.{8,})((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/,
              "Password must contain at least 8 characters, one uppercase, one number and one special case character"
            ),
          confirmPassword: Yup.string()
            .required("Please confirm your password")
            .when("password", {
              is: (password) =>
                password && password.length > 0 ? true : false,
              then: Yup.string().oneOf(
                [Yup.ref("password")],
                "Password doesn't match"
              ),
            }),
        })}
        onSubmit={async (
          { name, email, password },
          { setSubmitting, resetForm }
        ) => {
          try {
            const myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");

            const raw = JSON.stringify({
              name,
              email,
              password,
            });

            const requestOptions = {
              method: "POST",
              headers: myHeaders,
              body: raw,
            };

            const response = await fetch("/api/users", requestOptions);

            if (response.status !== 201) {
              const error = await response.text();
              throw new Error(error);
            }

            const result = await response.json();
            // console.log(result); //debug

            storeData(result);
            // Go to user tasks page
            history.push("/user/tasks");
          } catch (err) {
            toggleAlert("Sign up failed. Try with another email.");
            console.log(err); //debug,
          } finally {
            resetForm({});
            setSubmitting(false);
          }
        }}
      >
        {(props) => (
          <Form className="signing-form">
            <h1>Sign Up</h1>

            <Field name="name" type="name" placeholder="Name" />
            <div className="error-message">
              <ErrorMessage name="name" />
            </div>
            <Field name="email" type="email" placeholder="Email" />
            <div className="error-message">
              <ErrorMessage name="email" />
            </div>

            <Field name="password" type="password" placeholder="Password" />
            <div className="error-message">
              <ErrorMessage name="password" />
            </div>

            <Field
              name="confirmPassword"
              type="password"
              placeholder="Confirm Password"
            />
            <div className="error-message">
              <ErrorMessage name="confirmPassword" />
            </div>

            <Button variant="contained" type="submit">
              Sign Up
            </Button>
            <p>
              Already have an account? <Link to="/signin">Sign In</Link>
            </p>
          </Form>
        )}
      </Formik>
    </div>
  );
};
