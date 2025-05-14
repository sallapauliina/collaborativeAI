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
    
    Analyze the data focusing on two key areas:
    1. Inconsistencies: Identify contradictions or conflicting statements within the data
    2. Potential Bias: Detect possible sources of bias (researcher bias, selection bias, response bias, etc.)
    
    Only report findings if you identify actual inconsistencies or potential biases. If none are found in a category, leave it empty.
    
    Format your response as follows:
    [ANALYSIS]
    [INCONSISTENCIES]
    List and explain any inconsistencies found...
    [/INCONSISTENCIES]

    [BIAS]
    List and explain potential biases identified...
    [/BIAS]
    [/ANALYSIS]
    
    [SUGGESTIONS]
    Your specific suggestions for improvement...
    [/SUGGESTIONS]"""

def get_feedback_prompt() -> str:
    return """You are collaborating with a researcher to validate and improve qualitative data analysis. 
    The researcher has provided feedback on your analysis. Your role is to:
    1. Consider their feedback carefully
    2. If you agree with their points, incorporate them into your analysis
    3. If you disagree, explain why while maintaining a collaborative tone
    4. Suggest any additional insights based on the discussion

    Format your response as follows:
    [ANALYSIS]
    Your updated analysis incorporating agreed changes...
    [/ANALYSIS]
    
    [SUGGESTIONS]
    Your response to their feedback, clearly stating if you agree or disagree and why...
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
        return TaskDataResponse(text=response.text)

    def get_requirements(self) -> TaskRequirements:
        return TaskRequirements(needs_text=True, needs_image=False) 