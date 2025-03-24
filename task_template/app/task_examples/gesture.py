import logging
import os
from tasks.task_interface import Task
from models import (
    TaskDataRequest,
    TaskRequest,
    TaskDataResponse,
    ModelResponse,
    TaskRequirements,
)

logger = logging.getLogger(__name__)
current_folder = os.path.dirname(os.path.abspath(__file__))
with open(os.path.join(current_folder, "gesture_prompt.txt"), "r") as f:
    system_prompt = f.read()


class Gesture(Task):

    def get_system_prompt(self) -> str:
        """Generate response endpoint:
        generate the response based on given prompt and store the conversation
        in the history of the session (based on the session_id cookie)
        """    
        return system_prompt

    def process_model_answer(self, answer: ModelResponse) -> TaskDataResponse:
        # Again, we ignore the potential image here...
        return TaskDataResponse(text=answer.text)

    def generate_model_request(self, request: TaskDataRequest) -> TaskRequest:
        """Generate prompt endpoint:
        process pieces' data and plug them into the prompt
        """
        logger.info(request)
        # This could include an image, but for this task, we currently don't supply one
        return TaskRequest(
            text=request.text,
            system=self.get_system_prompt(),
            image=None,
        )

    def get_requirements(self) -> TaskRequirements:
        return TaskRequirements(needs_text=True, needs_image=False)
