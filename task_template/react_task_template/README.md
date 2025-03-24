# The ReactJS frontend - the light version (for students) 

In here, you will find the description of this react task template, all its components and what you should keep in mind while using this as a baseline for inserting your own task. This version allows complete freedom to students to create any kind of tasks they want as long as it can be put into the template (iframe, HTML, React codes,...).**There are only 3 places that you need to modify. which are explained in section I, II, and III**

## I. The environment file:
In the file [.env_example](../../.env_example), all the needed environment variables are listed. The details of these variables are [here](../../README.md#local-testing).

## II. Root component: 
The root component of this frontend is [App.jsx](src/App.jsx) which serves as the entrypoint for the application. **This is the place where you put your task/task component:**

You need to put your task inside the `<div className="main-interaction">`, where the placeholder `"Your task goes here"` is. It is recommended to create a React component for your own task, then import it and put it inside the div.

## III. API calls:
The two API calls are located inside the file [task.js](src/services/task.js):
- **`finishTask`**: it receives the user's rating as the parameter, sends it to the model through a post request to the `/api/v1/task/finish` endpoint. **Please change the value of `task_name` inside `ratingjson` to the name of your task so that the rating are stored correctly in the database**

- **`submitUserInput`**: it receives the user's message as the parameter, sends it to the model through a post request to the `/api/v1/task/process` endpoint, and returns the model's response.


## IV. Child components: 
All the child components are located [here](src/components). You don't need to modify anything inside them, but here is a quick run-through:

### 1. FeedbackForm [link](src/components/FeedbackForm.jsx):
This is the feedback form component, which appears When the `Finish` button is clicked. When the rating is submitted, it calls the `finishTask` function inside the file [task.js](src/services/task.js) to store the rating to the database.

### 2. FinishButton [link](src/components/FinishButton.jsx):
This component is the `Finish` button shown in the page. Clicking it will show the `FeedbackForm`

### 3. Footer [link](src/components/Footer.jsx):
This component serves as the Footer for this web application.

### 4. Header [link](src/components/Header.jsx):
This component serves as the Header for this web application.

## V. How to run:
You can then run the system by running `docker compose up`

If code has changed, you will need to run `docker compose up --build` to update the current code.

The frontend will then be reachable at `https://localhost`.

If you had to change the `NGINX_HTTPS_PORT`, the address where the frontend is run changes to `https://localhost:NGINX_HTTPS_PORT/` instead of `https://localhost`

NOTE: When connecting, your system will likely complain, that the certificates provided are not valid. Since this is for local development we provide some self signed certificates in the repo. Most browsers allow continuing by clicking something like "accept the risk".
DO NOT REUSE THESE CERTIFICATES/KEYS IF YOU DEPLOY THE SYSTEM OUTSIDE OF LOCAL DEVELOPMENT.