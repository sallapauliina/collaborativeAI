import logging
from tasks.task_interface import Task as TaskInterface
from models import (
    TaskDataRequest,
    TaskRequest,
    TaskDataResponse,
    ModelResponse,
    TaskRequirements,
)

logger = logging.getLogger(__name__)

def get_system_prompt() -> str:
    return """You are an expert qualitative data validator. Your role is to help researchers identify potential issues in their qualitative data. 
    Analyze the provided data for:
    1. Inconsistencies and contradictions
    2. Potential biases (researcher bias, selection bias, etc.)
    3. Missing or incomplete information
    4. Unclear or ambiguous statements
    5. Methodological issues
    
    Provide specific examples from the text and suggest improvements.
    
    Format your response as follows:
    [ANALYSIS]
    Your detailed analysis here...
    [/ANALYSIS]
    
    [SUGGESTIONS]
    Your specific suggestions for improvement...
    [/SUGGESTIONS]"""

class QualitativeValidation(TaskInterface):
    def __init__(self):
        self.system_prompt = get_system_prompt()

    def generate_model_request(self, request: TaskDataRequest) -> TaskRequest:
        """Generate a request for the AI model"""
        logger.info(request)
        # Extract text from inputData if it exists, otherwise use request.text
        text = request.inputData if isinstance(request.inputData, str) else request.text
        
        if text is None:
            text = ""  # Provide a default empty string if text is None
            
        return TaskRequest(
            text=text,
            system=self.system_prompt,
            image=None
        )

    def process_model_answer(self, response: ModelResponse) -> TaskDataResponse:
        """Process the AI model's response"""
        # The frontend will parse sections between [ANALYSIS] and [SUGGESTIONS] tags
        return TaskDataResponse(text=response.text)

    def get_requirements(self) -> TaskRequirements:
        return TaskRequirements(needs_text=True, needs_image=False) 