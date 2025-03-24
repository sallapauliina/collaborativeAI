import queue

import logging
logger = logging.getLogger("app")

class QueueHandler:
    def __init__(self):
        self.start_queue = queue.Queue()
        self.task_queue = queue.Queue()
        self.finish_queue = queue.Queue()        
        self.response_queues = {}
        self.responses = {}
        self.model_info = {}

    def add_answer(self, sessionID, messageID, answer):
        self.responses[sessionID][messageID] = answer

    def get_answer(self, sessionID, messageID):
        if not sessionID in self.responses or not messageID in self.responses[sessionID]:
            return None
        else:
            answer = self.responses[sessionID][messageID]
            self.responses[sessionID].pop(messageID)
            return answer
    def process_queue(self, session_id):
        queue = self.get_response_queue(session_id)
        try:
            if not queue.empty():
                response = queue.get(block = True, timeout= 3)
                self.add_answer(session_id, response.messageID, response)
        except Exception as e:
            #TODO: Handle this properly with a lock on the queue....
            logger.error(e)
            logger.error("Error processing queue, possibly got consumed by a different thread")
        
    def add_response_queue(self, sessionID):
        if sessionID not in self.response_queues:
            self.response_queues[sessionID] = queue.Queue()
            self.responses[sessionID] = {}

    def get_response_queue(self, sessionID) -> queue.Queue:
        if sessionID not in self.response_queues:
            self.response_queues[sessionID] = queue.Queue()
            self.responses[sessionID] = {}
        return self.response_queues[sessionID]
    
    def remove_response_queue(self, sessionID):
        if sessionID in self.response_queues:
            self.response_queues.pop(sessionID)
            self.responses.pop(sessionID)

    def get_model_info(self, sessionID) -> str:
        if sessionID not in self.response_queues:
            return None
        else:            
            return self.model_info[sessionID]    
    def set_model_info(self, sessionID, modelID) -> None:        
        self.model_info[sessionID] = modelID

    def clear_model_info(self, sessionID) -> None:        
        self.model_info.pop(sessionID)
        
    def clear_session(self, sessionID) -> None:
        self.remove_response_queue(sessionID)
        self.clear_model_info(sessionID)

queue_handler = QueueHandler()
