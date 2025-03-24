from typing import Any, List, Optional
from pydantic import BaseModel, Field, ConfigDict
from routers.router_models import InputMessage, Message

class TaskDataRequest(BaseModel):
    text: Optional[str] = None
    inputData: Any
    image: Optional[str] = None
    objective: Optional[str] = None


class TaskRequest(BaseModel):
    # The text of the request
    text: Optional[str] = Field(default="", nullable=True)
    # the image of the request
    image: Optional[str] = Field(default=None, nullable=True)
    # The system message of the request
    system: str


class OpenAIBasedRequest(BaseModel):
    # The messages that the model should process
    messages: Optional[List[Message]] = None
    # The model configuration
    model_config = ConfigDict(extra="ignore")

class OpenAIBasedDataRequest(BaseModel):
    userMessages: Optional[List[InputMessage]] = []
    objective: Optional[str] = None
    inputData: Optional[Any] = None
    model_config = ConfigDict(extra="ignore")

class ModelResponse(BaseModel):
    # The text of the request
    text: str
    # the image of the request
    image: Optional[str] = Field(default=None, nullable=True)


class TaskDataResponse(BaseModel):
    text: Optional[str] = None
    image: Optional[str] = None
    outputData: Optional[Any] = None


class TaskRequirements(BaseModel):
    needs_text: bool
    needs_image: bool
    multirequest: Optional[bool] = Field(default=False)


class TaskMetrics(BaseModel):
    metrics: Any
