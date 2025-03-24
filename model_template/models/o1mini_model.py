import os

from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
import logging
import model_pb2
from data_models import *
from models.basemodel import AIModel

logger = logging.getLogger("app")

model_definition = model_pb2.modelDefinition()
model_definition.needs_text = True
model_definition.needs_image = False
model_definition.can_text = True
model_definition.can_image = False
model_definition.modelID = "o1-mini"


class OpenAIImageModel(AIModel):
    def get_model_definition(self) -> model_pb2.modelDefinition:
        return model_definition

    def publish_metrics(self, metrics_json: str) -> None:
        logger.info(metrics_json)

    async def get_response(self, message: TaskInput) -> TaskOutput:
        model = ChatOpenAI(
            model="o1-mini",
            max_tokens=4096,
        )              
        ai_messages = message.model_dump()["messages"]
        for ai_message in ai_messages:
            if ai_message["role"] == "system":
                # o1mini does not understand system messages
                ai_message["role"] = "user"                
        AIresponse = model.invoke(ai_messages)
        print(f"AIresponse: {AIresponse.content}")
        taskResponse = TaskOutput()
        taskResponse.text = AIresponse.content
        return taskResponse
