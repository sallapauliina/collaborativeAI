import logging
from tasks.task_interface import Task
from models import (
    TaskDataRequest,
    TaskRequest,
    TaskDataResponse,
    ModelResponse,
    TaskRequirements,
)

logger = logging.getLogger(__name__)


class OpenAITask(Task):

    def process_model_answer(self, answer: ModelResponse) -> TaskDataResponse:
        raise NotImplementedError

    def generate_model_request(self, request: TaskDataRequest) -> TaskRequest:
        raise NotImplementedError
    
    def is_openAI_task(self):
        return True
    
    def get_requirements(self) -> TaskRequirements:
        return TaskRequirements(needs_text=True, needs_image=True)
