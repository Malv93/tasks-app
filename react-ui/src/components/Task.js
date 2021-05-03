import DeleteIcon from "@material-ui/icons/Delete";

export const Task = ({ createdAt, title, description, id, removeTask }) => {
  const dateOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  return (
    <div className="task">
      <h3 className="task-title">{title}</h3>
      <p className="task-description">{description}</p>
      <div className="task-footer">
        <p className="task-date">
          {new Date(createdAt).toLocaleString("en-US", dateOptions)}
        </p>
        <button className="delete-button" onClick={() => removeTask(id)}>
          <DeleteIcon />
        </button>
      </div>
    </div>
  );
};
