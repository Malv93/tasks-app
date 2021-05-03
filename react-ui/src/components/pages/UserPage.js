import { Task } from "../Task";
import { useState } from "react";
import { useFetchData } from "../../customHooks/useFetchData";
import { AddTaskForm } from "../forms/AddTaskForm";

export const UserPage = ({ token, toggleAlert }) => {
  const [tasks, setTasks] = useState([]);

  // Fetch user tasks and store in state
  const isPending = useFetchData({
    token,
    toggleAlert,
    url: "/api/tasks?sortBy=createdAt:desc",
    setData: setTasks,
  });

  // Delete a task
  async function removeTask(taskId) {
    try {
      const myHeaders = new Headers();
      myHeaders.append("Authorization", `Bearer ${token}`);

      const requestOptions = {
        method: "DELETE",
        headers: myHeaders,
      };

      const response = await fetch(`/api/tasks/${taskId}`, requestOptions);

      if (response.status !== 200) {
        const error = await response.text();
        console.log(error); //debug
        throw new Error(error);
      }

      // return the deleted task
      const result = await response.json();
      console.log(result);
      setTasks((tasks) => tasks.filter((task) => task._id !== taskId));
    } catch (err) {
      //Show Alert with error
      toggleAlert("Failed to remove the task, please contact the assistance.");
    }
  }

  // Add a task
  async function addTask(taskFields) {
    try {
      const raw = JSON.stringify(taskFields);

      const myHeaders = new Headers();
      myHeaders.append("Authorization", `Bearer ${token}`);
      myHeaders.append("Content-Type", "application/json");

      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
      };

      const response = await fetch("/api/tasks", requestOptions);

      if (response.status !== 201) {
        const error = await response.text();
        console.log(error); //debug
        throw new Error(error);
      }

      const task = await response.json();

      setTasks((tasks) => [task, ...tasks]);
    } catch (error) {
      toggleAlert("Failed to add a new task, please contact the assistance.");
    }
  }

  return (
    <div className="page-content">
      <AddTaskForm addTask={addTask} />
      {isPending && "Loading..."}
      {tasks && (
        <div className="tasks-list">
          {tasks.map(({ _id, title, description, createdAt }) => (
            <Task
              key={_id}
              id={_id}
              title={title}
              description={description}
              createdAt={createdAt}
              removeTask={removeTask}
            />
          ))}
        </div>
      )}
    </div>
  );
};
