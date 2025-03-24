from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Union


class OpenAIMessage(BaseModel):
    type: str
    
class ImageURL(BaseModel):
    url: str

class ImageMessage(OpenAIMessage):
    image_url: ImageURL
    model_config = ConfigDict(extra="ignore")


    model_config = ConfigDict(extra="ignore")


class TextMessage(OpenAIMessage):
    text: str
    model_config = ConfigDict(extra="ignore")

class Message(BaseModel):
    role: str
    content: Union[str, List[Union[ImageMessage, TextMessage]]]
    model_config = ConfigDict(extra="ignore")


class TaskInput(BaseModel):
    messages: Optional[List[Message]] = None # The messages that the model should process
    model_config = ConfigDict(extra="ignore")    
        

class TaskOutput(BaseModel):
    text: str = Field(default="", nullable=True)  # The response Message
    image: str = Field(default=None, nullable=True)  # The image to be processed
