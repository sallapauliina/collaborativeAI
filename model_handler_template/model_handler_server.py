import grpc.aio as grpc
from concurrent import futures
import json
import asyncio
import random
from database import AtlasClient
import os
from datetime import datetime
from pytz import timezone
import logging
import logging.config

logging.config.fileConfig("logging.conf", disable_existing_loggers=False)

logger = logging.getLogger("app")

# import the generated classes :
import model_handler_pb2
import model_handler_pb2_grpc

port = 8061

DB_NAME = "task_rating"
COLLECTION_NAME = "informal"
if not os.environ.get("ATLAS_URI", None) == None:
    atlas_client = AtlasClient(os.environ["ATLAS_URI"], DB_NAME)
    rating_collection = atlas_client.get_collection(COLLECTION_NAME)
    atlas_client.ping()

print("Connected to Atlas instance! We are good to go!")


class ModelHandler(model_handler_pb2_grpc.ModelHandlerServicer):
    def __init__(self):
        self.model_list = (
            []
        )  # a list of all the modelDefinition that got registered to the handler
        self.assignment_list = (
            {}
        )  # a dictionary for storing the modelID-sessionID connection

    def startTask(self, request, context):
        suitable_models_list = []

        modelRequirements = {
            "needs_text": request.needs_text,
            "needs_image": request.needs_image,
            "sessionID": request.sessionID,
        }
        # Scan in the model list for the suitable model
        for model in self.model_list:
            if modelRequirements["needs_text"] and modelRequirements["needs_image"]:
                if model["can_text"] and model["can_image"]:
                    suitable_models_list.append(model)
            elif modelRequirements["needs_text"]:
                if model["can_text"] and not model["needs_image"]:
                    suitable_models_list.append(model)
            elif modelRequirements["needs_image"]:
                if model["can_image"] and not model["needs_text"]:
                    suitable_models_list.append(model)
        # choose a random model if there are multiple that sastisfy the requirements
        chosen_model = random.choice(suitable_models_list)
        print("The chosen model is")
        print(chosen_model)

        # connect the modelID to the sessionID
        self.assignment_list[modelRequirements["sessionID"]] = chosen_model["modelID"]

        return model_handler_pb2.Empty()

    def finishTask(self, request, context):
        taskMetrics = request
        # This would happen if "finish task" is called before "start task"
        # At this point no model was selected, since nothing has happened yet..
        # There is no point in storing the metrics in the db, since there was no model...
        if taskMetrics.sessionID not in self.assignment_list:
            return model_handler_pb2.modelInfo(
                modelName="No model assigned", sessionID=taskMetrics.sessionID
            )
        modelID = self.assignment_list[taskMetrics.sessionID]

        # Metrics
        metrics = taskMetrics.metrics
        parsedMetrics = json.loads(metrics.replace("'", '"'))

        rating = parsedMetrics["rating"]
        task_name = parsedMetrics["task_name"]

        # Time stamp
        tz = timezone("Europe/Helsinki")
        submitted_time = datetime.now(tz)

        # Store the metrics to the db
        new_metric = {
            "task_name": task_name,
            "model": modelID,
            "timeStamp": submitted_time,
            "collaboration_metric": rating["collaboration_metric"],
            "ai_performance_metric": rating["ai_performance_metric"],
            "coordination_metric": rating["coordination_metric"],
            "efficiency_metric": rating["efficiency_metric"],
        }

        if not os.environ.get("ATLAS_URI", None) == None:
            rating_collection.insert_one(new_metric)

        # Break the model assignment after sending the metrics
        del self.assignment_list[taskMetrics.sessionID]

        return model_handler_pb2.modelInfo(
            modelName=modelID, sessionID=taskMetrics.sessionID
        )

    def sendToModel(self, request, context):
        taskRequest = request
        modelID = self.assignment_list[taskRequest.sessionID]

        return model_handler_pb2.modelRequest(
            request=taskRequest.request,
            modelID=modelID,
            sessionID=taskRequest.sessionID,
            messageID=taskRequest.messageID,
        )

    def returnToTask(self, request, context):
        modelAnswer = request

        return model_handler_pb2.modelAnswer(
            answer=modelAnswer.answer,
            sessionID=modelAnswer.sessionID,
            messageID=modelAnswer.messageID,
        )

    def registerModel(self, request, context):
        print("===Register a model===")
        print(request)
        modelDefinition = {
            "needs_text": request.needs_text,
            "needs_image": request.needs_image,
            "can_text": request.can_text,
            "can_image": request.can_image,
            "modelID": request.modelID,
        }

        self.model_list.append(
            modelDefinition
        )  # add the models to the model list on startup
        return model_handler_pb2.Empty()


async def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    model_handler_pb2_grpc.add_ModelHandlerServicer_to_server(ModelHandler(), server)
    print("Starting the model handler server. Listening on port : " + str(port))
    server.add_insecure_port("0.0.0.0:{}".format(port))
    await server.start()
    await server.wait_for_termination()


asyncio.run(serve())
