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
    return """You are an expert qualitative data validator. Your role is to help researchers identify quality issues in their qualitative data. 
    
    Analyze the data and format EACH finding as a suggestion with the EXACT structure shown below:
    
    [ANALYSIS]
    [INCONSISTENCIES]
    1. [Title: Resolve data inconsistency]
    Description: Detailed explanation of what needs to be fixed and why
    Addresses: Which part of the data this suggestion addresses
    
    2. [Title: Another inconsistency fix]
    Description: ...
    Addresses: ...
    [/INCONSISTENCIES]

    [BIAS]
    1. [Title: Address potential bias]
    Description: Detailed explanation of the bias and how to address it
    Addresses: Which aspects of the research this suggestion improves
    
    2. [Title: Another bias mitigation]
    Description: ...
    Addresses: ...
    [/BIAS]
    [/ANALYSIS]
    
    [SUGGESTIONS]
    1. [Title: General improvement suggestion]
    Description: Detailed explanation of the suggested improvement
    Addresses: What aspect of the research this improves
    [/SUGGESTIONS]

    IMPORTANT: 
    - Use the EXACT format shown above
    - Make all feedback actionable as suggestions
    - Number each item starting from 1
    - Include ALL required fields for each item
    - If no items in a category, still include the category tags but leave empty
    """

def get_feedback_prompt() -> str:
    return """You are collaborating with a researcher to validate and improve qualitative data analysis. 
    Consider their feedback and perform a new analysis of the data with their suggestions in mind.
    
    Use the same structured format as the initial analysis:
    [ANALYSIS]
    [INCONSISTENCIES]
    1. [Title: Brief title]
    Description: Detailed explanation
    Addresses: What this addresses
    [/INCONSISTENCIES]

    [BIAS]
    1. [Title: Brief title]
    Description: Detailed explanation
    Addresses: What this addresses
    [/BIAS]
    [/ANALYSIS]
    
    [SUGGESTIONS]
    1. [Title: Brief title]
    Description: Detailed explanation
    Addresses: What this addresses
    [/SUGGESTIONS]"""

class QualitativeValidation(TaskInterface):
    def __init__(self):
        self.system_prompt = get_system_prompt()
        self.feedback_prompt = get_feedback_prompt()

    def generate_model_request(self, request: TaskDataRequest) -> TaskRequest:
        """Generate a request for the AI model"""
        logger.info(request)
        
        if isinstance(request.inputData, dict) and request.inputData.get("type") == "feedback":
            # Handle feedback differently
            return TaskRequest(
                text=f"""Original Data: {request.inputData.get('originalData', '')}
                Current Analysis: {request.inputData.get('currentAnalysis', '')}
                Feedback: {request.inputData.get('text', '')}""",
                system=self.feedback_prompt,
                image=None
            )
        
        # Handle initial analysis
        text = request.inputData if isinstance(request.inputData, str) else request.text
        if text is None:
            text = ""
            
        return TaskRequest(
            text=text,
            system=self.system_prompt,
            image=None
        )

    def process_model_answer(self, response: ModelResponse) -> TaskDataResponse:
        """Process the AI model's response"""
        logger.info(f"AI Response: {response.text}")
        return TaskDataResponse(text=response.text)

    def get_requirements(self) -> TaskRequirements:
        return TaskRequirements(needs_text=True, needs_image=False) 