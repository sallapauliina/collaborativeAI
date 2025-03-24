# The ReactJS frontend

In here, you will find the description of this react task template, all its components and what you should keep in mind while using this as a baseline for inserting your own task. **There are only 2 places that you need to modify. which are explained in section I and II**

## I. Root component: 
The root component of this frontend is [App.jsx](src/App.jsx) which serves as the entrypoint for the application. **This is the place where you put your task/task component:**

You need to put your task inside the `<div className="main-interaction">`, where the placeholder `"Your task goes here"` is. It is recommended to create a React component for your own task, then import it and put it inside the div.

## II. API calls:
The API call function `finishTask` is located in the file [task.js](src/services/task.js). It receives the user's rating as the parameter, sends it to the model through a post request to the `/api/v1/task/finish` endpoint. **Please change the value of `task_name` inside `ratingjson` to the name of your task so that the rating are stored correctly in the database**

## III. Child components: 
All the child components are located [here](src/components). You don't need to modify anything inside them, but here is a quick run-through:

### 1. FeedbackForm [link](src/components/FeedbackForm.jsx):
This is the feedback form component, which appears When the `Finish` button is clicked. When the rating is submitted, it calls the `finishTask` function inside the file [task.js](src/services/task.js) to store the rating to the database.

### 2. FinishButton [link](src/components/FinishButton.jsx):
This component is the `Finish` button shown in the page. Clicking it will show the `FeedbackForm`

### 3. Footer [link](src/components/Footer.jsx):
This component serves as the Footer for this web application.

### 4. Header [link](src/components/Header.jsx):
This component serves as the Header for this web application.
