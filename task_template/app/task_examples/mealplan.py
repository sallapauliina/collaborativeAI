import logging
from tasks.task_interface import Task
import json
from models import (
    TaskDataRequest,
    TaskRequest,
    TaskDataResponse,
    ModelResponse,
    TaskRequirements,
)

logger = logging.getLogger(__name__)


class Mealplan(Task):

    def get_system_prompt(self, objective: str) -> str:
        """Generate response endpoint:
        generate the response based on given prompt and store the conversation
        in the history of the session (based on the session_id cookie)
        """

        system_prompt = f"""You are working together with a user to create a mealplan. 
            The description of the meal plan may include duration, dietary restrictions, location, nutritional 
            goals, and other preferences and you must follow it. The description is as follows: {objective}
            You will get a message from the user in the form COMMENT_LINE: COMMENT_LINE is the comment made by the user.
            Your answer must take the user's comment into consideration.
            Your meal plan must be wrapped inside square brackets, along with some comments about the meal plan that 
            you gave: (example: "[<the recommended meal plan>] <the comment>").
            The meal plan must be formatted in JSON. Follows the form of this example:\n
            {{
                "Day 1": 
                    {{ 
                        "Breakfast": "A traditional German breakfast with fresh bread rolls (Brötchen), cold cuts, cheese, and a hard-boiled egg.", 
                        "Lunch": "Currywurst with a side of fries - a popular fast food option in Berlin.", 
                        "Dinner": "Sauerbraten with red cabbage and dumplings - to try authentic German cuisine." 
                    }}, 
                "Day 2": 
                    {{ 
                        "Breakfast": "A light breakfast with muesli and yogurt, local fruit, and a cup of German coffee.", 
                        "Lunch": "A doner kebab - a popular and convenient Berlin street food.", 
                        "Dinner": "Rinderroulade - rolled beef steak, with potato salad." 
                    }} 
            }}
            If the user ask a question, you answer it as a comment.
            You are curious, and always ready and eager to ask the user question if needed."""
        return system_prompt

    def process_model_answer(self, answer: ModelResponse) -> TaskDataResponse:
        # Again, we ignore the potential image here...
        return TaskDataResponse(text=answer.text)

    def generate_model_request(self, request: TaskDataRequest) -> TaskRequest:
        logger.info(request)
        linetag = "COMMENT" if request.inputData["comment"] else "NEWPLAN"
        plan = f"PLANS : {json.dumps(request.inputData['plans'])}"
        newplan = f"{linetag} : {request.text}"

        return TaskRequest(
            text=f"{plan} \n{newplan}",
            system=self.get_system_prompt(request.objective),
            image=None,
        )
    
    def get_requirements(self) -> TaskRequirements:
        return TaskRequirements(needs_text=True, needs_image=False)
    

    