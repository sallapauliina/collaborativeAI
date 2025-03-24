from models import (
    TaskDataRequest,
    TaskDataResponse,
    TaskRequest,
    ModelResponse,
    TaskRequirements,   
    OpenAIBasedRequest,
    OpenAIBasedDataRequest
)
class ArenaTask:
    def get_requirements(self) -> TaskRequirements:
        raise NotImplementedError()
    def is_openai_task(self):
        raise NotImplementedError()
    
class Task(ArenaTask):
    def __init__(self):
        pass

    def generate_model_request(
        self,
        request: TaskDataRequest,
    ) -> TaskRequest:
        raise NotImplementedError()

    def process_model_answer(self, answer: ModelResponse) -> TaskDataResponse:
        raise NotImplementedError()
    
    def is_openai_task(self):
        return False

class OpenAITask(ArenaTask):
    def __init__(self):
        pass

    def generate_model_request_openAI(
        self,
        request: OpenAIBasedDataRequest,
    ) -> OpenAIBasedRequest:
        """
        From the input data generate a messages array compatible with OpenAI.
        """
        raise NotImplementedError()

    def process_model_answer_openAI(self, answer: ModelResponse) -> TaskDataResponse:        
        # Default is a noop, simply converting the data.
        return TaskDataResponse(text=answer.text,image=answer.image)        

    def is_openai_task(self):
        return True

