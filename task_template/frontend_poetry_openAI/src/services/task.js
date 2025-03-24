import axios from "axios";

const baseUrl = "/api/v1/task";
const prev_messages = [];

const submitUserInput = (request) => {
  const linetag = request.inputData["comment"] ? "COMMENT" : "NEWLINE";
  const poemline = `POEM : ${JSON.stringify(request.inputData["poem"])}`;
  const newline = `${linetag} : ${request.text}`;
  const newMessage = {
    role: "user",
    content: [{ type: "text", text: `${poemline} \n ${newline}` }],
  };
  prev_messages.push(newMessage);
  const completions_request = axios.post(`${baseUrl}/completions`, {
    inputData: request.inputData,
    objective: request.objective,
    userMessages: prev_messages,
  });
  return completions_request.then((response) => {
    prev_messages.push({
      role: "assistant",
      content: [{ type: "text", text: response.data.text }],
    });
    return response.data;
  });
};

const finishTask = (rating) => {
  const ratingjson = {
    metrics: {
      rating: rating,
      task_name: "poetry_task",
    },
  };
  console.log(ratingjson);
  axios
    .post(`/api/v1/task/finish`, ratingjson)
    .then((response) => {
      console.log(response);
    })
    .catch((error) => {
      console.log(error);
    });
};

export default {
  submitUserInput,
  finishTask,
};
