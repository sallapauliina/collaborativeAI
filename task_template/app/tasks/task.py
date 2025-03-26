import os

# define the Task
from task_examples import poetry, tangram, gesture, openai_task, mealplan, qualitative_validation

currentTask = os.environ.get("TASK_NAME")

if currentTask == "tangram":
    task = tangram.Tangram()
elif currentTask == "openai":
    task = openai_task.OpenAITask()
elif currentTask == "gesture":
    task = gesture.Gesture()
elif currentTask == "poetry_openai":
    task = poetry.PoetryOpenAI()
elif currentTask == "mealplan":
    task = mealplan.Mealplan()
elif currentTask == "qualitative_validation":
    task = qualitative_validation.QualitativeValidation()
else:
    task = poetry.Poetry()
