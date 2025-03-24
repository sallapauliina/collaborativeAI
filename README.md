# Collaborative AI Arena

The collaborative AI arena is intended to serve as a basis for evaluation of collaboration between AI and Humans. The idea is to design and evaluate tasks which are performed with input from both sides, and figure out if the collaboration was successful.
Users should be presented with a task that they perform together with the AI and metric should be used to evaluate the different

This repository contains most of the code necessary to add a Model or a Task.

## Task Templates:

There are two tasks, `poetry` and `tangram` currently available as examples. Poetry has a frontend created in ReactJS and tangram in vueJS using a godot game.

### Prompt:

The prompt for the tasks are located at `task_template/app/task_examples` For poetry, the task is in [poetry.py](task_template/app/task_examples/poetry.py)
for the tangram task it is located in [tangram.py](task_template/app/task_examples/tangram.py)
Although the current prompts serve as a starting point for the tasks, they are by no means optimized. Because of that, we highly recommend you to experiment and do some prompt engineering for it to fit whatever task you have in mind.

## Frontend:

There are two example frontends. One is for a poetry task done in ReactJS, the other is for a tangram game using vueJS and a godot game.

### Poetry

The main idea of the task is that the user submits the theme/objective for the poem and then they collaborate with the model to complete it. However, This task is not limited to poem writing only as you can freely switch between a line-by-line rendering (poem) or a continuous rendering (paragraph). For a more detailed explanation, please go [here](task_template/frontend_poetry/README.md)

### Tangram

The idea is that the human and the AI work together to build something with a tangram game. At the moment the game provided is restricted to two pieces, so there iis only a limited amount of options. The game can be replaced by whatever the user wants, and just represents one possibility.
For a more detailed explanation, please go [here](task_template/frontend_tangram/README.md)

## Model selection:

At the moment, the system supports two models [o1-mini](model_template/models/openAI_model.py) and [gpt4-o](model_template/models/openAI_image_model.py), which are located inside the folder [model_template/models](model_template/models).

You can change between the two models by changing the value of the variable `ai_model` between `OpenAIImageModel()` and `OpenAIModel()` in the file [model_template/model.py](model_template/model.py).
If you have time and want to add your own models to the system, feel free to do so by following the template located in the file [basemodel.py](model_template/models/basemodel.py) and using the already existing model files as guidance.

## Templates

The `task_template` and `model_template` folders contain template applications for deployment on the AI Builder infrastructure.
They indicate how to implement a model and a task and supply most infrastructure necessary to minimise the requirements of a user to adopt their code.
Details are provided in the respective README files.

## Local testing
<a id="local-testing"></a>
To test things locally and see if they work, we provide a docker compose file along with a simple orchestrator.

To run locally you will need docker installed!

In addition to docker, you will need to set three environment variables in a .env file in the source folder (you can use .env_exmaple as a template):

- TASK_DOCKERFILE: This refers to the dockerfile of the Task you want to test.
  - There are currently 3 options: `Dockerfile_poetry`, `Dockerfile_tangram` and `Dockerfile_gesture`.
- MODEL: Refers to the model that is supposed to be used. There are currently 5 "default" models.
  - 1. aalto: A model using the Aalto APIs. This model requires you to use an Aalto OpenAI API key and be on the Aalto network
  - 2. aalto_image: Similar to aalto but has image processing capabilities
  - 3. openai: the GPT4_turbo model (your key needs to be an OpenAI API key)
  - 4. openai_image: the GPT4o-vision model with image processing capabilities (your key needs to be an OpenAI API key)
  - 5. o1mini: the GPT4o-mini model (your key needs to be an OpenAI API key)
- OPENAI_API_KEY: Your OPENAI (Or Aalto Azure) API key for the model.
- NGINX_HTTPS_PORT: Default is 443 (normal HTTPS port). If you run docker/podman rootless you will need to change this port to a port above 1000 as ports below 1000 are reserved to system processes (i.e. need root permissions).

You can then run the system by running `docker compose up`

If code has changed, you will need to run `docker compose up --build` to update the current code.

The frontend will then be reachable at `https://localhost`.

If you had to change the `NGINX_HTTPS_PORT`, the address where the frontend is run changes to `https://localhost:NGINX_HTTPS_PORT/` instead of `https://localhost`

NOTE: When connecting, your system will likely complain, that the certificates provided are not valid. Since this is for local development we provide some self signed certificates in the repo. Most browsers allow continuing by clicking something like "accept the risk".
DO NOT REUSE THESE CERTIFICATES/KEYS IF YOU DEPLOY THE SYSTEM OUTSIDE OF LOCAL DEVELOPMENT.
