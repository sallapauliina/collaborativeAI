import axios from 'axios'

const baseUrl = "/api/v1/task"

const finishTask = (rating) => {
  const ratingjson = {
    metrics: {
      rating: rating, 
      task_name: "placeholder" //change this to your task name
    }
  }
  axios
    .post(`${baseUrl}/finish`, ratingjson)
    .then((response) => {
      console.log(response)
    })
    .catch((error) => {
      console.log(error)
    })
}

export default { 
  finishTask
}