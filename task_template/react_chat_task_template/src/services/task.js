import axios from 'axios'

const baseUrl = "/api/v1/task"

const submitUserInput = async (data) => {
  const response = await axios.post(`${baseUrl}/process`, data)
  return response.data
}

const finishTask = async (data) => {
  const response = await axios.post(`${baseUrl}/finish`, data)
  return response.data
}

export default { 
  finishTask,
  submitUserInput
}