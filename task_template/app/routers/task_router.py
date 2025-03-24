from fastapi import APIRouter, Depends, Request
from models import (
    TaskDataRequest,
    TaskDataResponse,
    ModelResponse,
    TaskRequirements,
    TaskMetrics,
    OpenAIBasedDataRequest,
)
from routers.router_models import (
    ConversationItem,
    TaskRequest,
    SessionData,
)
from routers.session import get_session, clear_session
from typing import Dict, List, Annotated
from services.completion_service import CompletionService
from tasks.task_interface import Task
import asyncio
import logging
from grpc_server.queue_handler import queue_handler
import grpc_server.tasks_pb2 as grpc_models
from datetime import datetime

logger = logging.getLogger(__name__)
task_router = APIRouter(prefix="/api/v1/task")

from uuid import uuid4
import json


@task_router.post("/completions")
async def chat_completion_endpoint(
    task_data: OpenAIBasedDataRequest,
    task_handler: Annotated[CompletionService, Depends(CompletionService)],
    session: SessionData = Depends(get_session),
) -> TaskDataResponse:
    """
    More "openAI" like endpoint, which takes a set of messages along with additional input data.
    NOTE: the Messages are not allowed to contain a SYSTEM message, as the system message has to be added
    during task processing IN the server as to not allow free use of an endpoint for general chatting!
    """
    sessionID = session.id
    messageID = str(uuid4())
    task_props = task_handler.get_requirements()
    startRequest = grpc_models.modelRequirements()
    startRequest.sessionID = sessionID
    startRequest.needs_text = task_props.needs_text
    startRequest.needs_image = task_props.needs_image

    logger.info(startRequest)
    if not sessionID in queue_handler.response_queues:
        queue_handler.start_queue.put(startRequest)

    # Wait for the response queue to be created
    while not sessionID in queue_handler.response_queues:
        await asyncio.sleep(1)
    # Submit the task to the model
    logger.info("Task started, submitting to model")

    # get the messages that have a role of system from the task_data
    model_request = task_handler.build_model_request_from_open_AI_request(task_data)
    # Add the session ID to the model request
    model_request.sessionID = sessionID
    model_request.messageID = messageID
    queue_handler.task_queue.put(model_request)
    logger.info("Submitted, awaiting response")
    # And wait for the response to arrive:
    while True:
        answer = queue_handler.get_answer(sessionID, messageID)
        if answer == None:
            queue_handler.process_queue(sessionID)
            await asyncio.sleep(1)
        else:
            logger.info("Supplying response")
            openAIResponse = task_handler.interpret_model_response_openAI(answer)
            return openAIResponse


@task_router.post("/process")
async def process_task_data(
    task_data: TaskDataRequest,
    task_handler: Annotated[CompletionService, Depends(CompletionService)],
    session: SessionData = Depends(get_session),
) -> TaskDataResponse:
    """Generate prompt endpoint:
    process pieces' data and plug them into the prompt
    """
    history = session.history
    sessionID = session.id
    messageID = str(uuid4())
    task_props = task_handler.get_requirements()
    startRequest = grpc_models.modelRequirements()
    startRequest.sessionID = sessionID
    startRequest.needs_text = task_props.needs_text
    startRequest.needs_image = task_props.needs_image
    logger.info(startRequest)
    if not sessionID in queue_handler.response_queues:
        queue_handler.start_queue.put(startRequest)

    # Wait for the response queue to be created
    while not sessionID in queue_handler.response_queues:
        await asyncio.sleep(1)
    # Submit the task to the model
    logger.info("Task started, submitting to model")
    model_request = task_handler.build_model_request(task_data, history)
    # Add the session ID to the model request
    model_request.sessionID = sessionID
    model_request.messageID = messageID
    queue_handler.task_queue.put(model_request)
    logger.info("Submitted, awaiting response")
    # And wait for the response to arrive:
    while True:
        answer = queue_handler.get_answer(sessionID, messageID)
        if answer == None:
            queue_handler.process_queue(sessionID)
            await asyncio.sleep(1)
        else:
            logger.info("Supplying response")
            update = task_handler.interpret_model_response(answer, history)
            return update


@task_router.post("/finish")
async def finish(
    source_request: Request,
    request: TaskMetrics,
    session: SessionData = Depends(get_session),
):
    """Finish task endpoint:
    delete the session based on the session_id cookie when the user decides
    their task is done
    """
    finishObj = {"sessionID": session.id, "metrics": json.dumps(request.metrics)}
    logger.info(finishObj)
    queue_handler.finish_queue.put(finishObj)
    while not session.id in queue_handler.model_info:
        await asyncio.sleep(1)
    modelinfo = queue_handler.get_model_info(session.id)
    # Clear the model info
    queue_handler.clear_session(session.id)
    clear_session(source_request)
    return {"modelInfo": modelinfo}
