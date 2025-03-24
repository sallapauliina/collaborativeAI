import axios from 'axios'

const baseUrl = "/api/v1/task"

const submitUserInput = (newUserMessage) => {
  const request = axios.post(`${baseUrl}/process`, newUserMessage)
  return request.then(response => response.data)
}

const finishTask = (rating) => {
  const ratingjson = {
    metrics: {
      rating: rating, 
      task_name: "poetry_task"
    }
  }
  console.log(ratingjson)
  axios
    .post(`/api/v1/task/finish`, ratingjson)
    .then((response) => {
      console.log(response)
    })
    .catch((error) => {
      console.log(error)
    })
}

export default { 
  submitUserInput, 
  finishTask
}