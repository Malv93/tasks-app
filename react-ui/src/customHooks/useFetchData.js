import { useState, useEffect } from "react";

export const useFetchData = ({ url, token, toggleAlert, setData }) => {
  //state of the custom fetch
  const [isPending, setIsPending] = useState(true);

  //After first mount fetch tasks from db
  //Does not execute after each rerender
  useEffect(() => {
    // Used to interrupt a fetch
    const abortCont = new AbortController();

    console.log("fetch data");

    const fetchTasks = async () => {
      try {
        const myHeader = new Headers();
        myHeader.append("Authorization", `Bearer ${token}`);

        const requestOptions = {
          method: "GET",
          headers: myHeader,
          signal: abortCont.signal, // Used to interrupt a fetch
        };

        const response = await fetch(url, requestOptions);

        if (response.status !== 200) {
          const error = await response.text();
          console.log(error); //debug
          throw new Error(error);
        }

        const result = await response.json();

        setData(result);
        setIsPending(false);
      } catch (err) {
        if (err.name === "AbortError") {
          console.log("fetch aborted");
        }
        console.log(err);
        toggleAlert("Failed to fetch your data.");
      }
    };

    fetchTasks();
    // Cleanup function
    return () => abortCont.abort();
  }, [token, url, toggleAlert, setData]);

  return isPending;
};
