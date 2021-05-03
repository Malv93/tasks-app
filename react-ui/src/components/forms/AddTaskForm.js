import { useState } from "react";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import AddIcon from "@material-ui/icons/Add";
import Fab from "@material-ui/core/Fab";
import Zoom from "@material-ui/core/Zoom";

export const AddTaskForm = ({ addTask }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Formik
      initialValues={{
        title: "",
        description: "",
      }}
      validationSchema={Yup.object({
        title: Yup.string()
          .max(30, "Max 30 characters")
          .required("Required field"),
        description: Yup.string()
          .max(200, "Max 200 characters")
          .required("Required field"),
      })}
      onSubmit={async (values, { setSubmitting, resetForm }) => {
        await addTask(values);
        //Clear form after submit
        resetForm({});
        setSubmitting(false);
        setExpanded(false);
      }}
    >
      {(props) => (
        <Form className="add-task-form">
          {expanded && (
            <>
              <Field name="title" type="text" placeholder="Add Title..." />
              <div className="text-danger">
                <ErrorMessage name="title" />
              </div>
            </>
          )}
          <Field
            name="description"
            as="textarea"
            type="text"
            rows={expanded ? 3 : 1}
            placeholder="Write a Task..."
            onSelect={() => {
              setExpanded(true);
            }}
          />
          <div className="text-danger">
            <ErrorMessage name="description" />
          </div>
          <Zoom in={expanded}>
            <Fab type="submit">
              <AddIcon />
            </Fab>
          </Zoom>
        </Form>
      )}
    </Formik>
  );
};
