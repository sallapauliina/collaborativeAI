import logging

from fastapi import HTTPException

from tasks.task_interface import OpenAITask
from routers.router_models import Message
from models import (
    OpenAIBasedDataRequest,
    OpenAIBasedRequest,    
    TaskDataResponse,
    ModelResponse,
    TaskRequirements,

)

logger = logging.getLogger(__name__)


def get_chat_prompt(objective : str) -> str :
    game_reference = {
        "type": "text", "text":"""Reference Information about the game: 
        You and the human user are playing a tangram game, arranging the pieces to form an objective shape. 
        The pieces are named by their colors: Red, Purple, Yellow, Green, Blue, Cream, and Brown.
        Red and Cream are two large triangles, Yellow and green are two small triangles, Blue is a medium triangle, Purple is a small square, Brown is a tilted parallelogram.
        We consider 0 degrees of rotation the triangles with their hypotenuse facing down, and the square in the square position (so the diamond shape corresponds to 45 degrees of rotation)
        Example logical plays: Matching shapes can allow new larger shapes to appear, uniting two triangles of the same size by their Hypotenuse creates a square of in the location. The Purple Square or a square created of 2 triangles can serve to form many things like heads, bodies, bases of structures. 
        Two triangles can also form a larger triangle when combined.
        """
    }
    chat_prompt = {"type": "text", "text": """You are an AI chatting with a Human Player thats arraging tangram tangram pieces with you and your co-assistents to reach a certain objective. 
        To answer them, you will have access to the message history, an image of the current board, an image of the current piece drawer where the unplaced pieces lie.
        Your task:
        1. Review what you know about the game state.
        2. Consider the players message and reply logically in an approachable and friendly way.

        Rules:
        - If you suggest moves or plays, always explicity describe how pieces should be placed in relation to each other.
        - If you suggest either the move to create a large square or to create a large triangle, say it explicity. Ex: "Make a big square by using Cream and Red" or "Make a big triangle, placing Red to clockwise direction of Cream"
        - Each individual piece, if present in a suggested move, should have a explicit rotation (except for the moves that form big squares and big triangles).
        - If you disagree with an idea given by the player on how you should approach the challege, try to find a middle ground.
        - If the game already looks finished to you, you can say it looks done.

        Consider the previous messages and keep your message short, at most 1-3 sentences, the objective is a human-like nice short reply.
        Remember you are collaborating so don't order ideias suggest them in a collaborative manner.
        This message may not be the first in the conversation, but u can see the chat history in the previous message.
        Examples:
        - "Hey, well i think we could begin with the tail, using the medium blue triagle for it."
        - "Ok, got it, i'll try to help you achieve that."
        - "Alright I'll try to use the brown piece to create a tail."
        - "I don't think the yellow piece would make a good roof due to it's size, maybe we could use cream for the same objective."
        - "Sounds great, let's begin then!"
        - "I think the game already looks like our objective."
        """
    }
    objective = {"type": "text", "text": f"Your objetive this game is to form the shape of {objective}"}
    return {"role" : "system", "content":  [game_reference, chat_prompt, objective]}


def get_move_extraction_prompt(figures_names: str, possible_directions : str) -> str:
    move_extraction_system_prompt = f"""You are currently extracting the first move from a detailed play suggestion by the AI. 
        You must convert that move into one of the following grammars formats: 
        - [PieceToMove], [Direction], [PieceOnBoard], (Optional: [Direction], [PieceOnBoard], ...), [DegreesOfRotation], [FlipXAxis], [FlipYAxis]. 
        Where any piece name is a valid name piece between the names {figures_names}, any direction is one of the following {possible_directions} + ", any rotation degrees value must be 0,45,90,135,180,225,270,315 and any flip value is 0 or 1 (if not mentioned 0).
        This format is the default one, except when special moves for triangle and square creation are suggested.
        - Square [reference piece] [piece to move]
        This format is only used when a suggested move says something along the lines of "Form a Square with" and then two triangle pieces names, note which one is being moved and which one is already in place.
        - Triangle [reference piece] [direction] [piece to move]
        Where direction is either clockwise or anticlockwise.
        This format is only used when a suggested move says something along the lines of "Form a triangle with" and then two triangle pieces names and a direction, note which one is being moved and which one is already in place.
        - Finish: [Message]
        This format is only used when a suggested move says something along the lines of "Looks finished" or something of the type, message should be a friendly message to the human.
        - Rotate [piece to rotate] [rotation]
        This format is only used when a suggested move says something along the lines of "Just rotate" or something of the type, rotation should be the suggested one.
                        
        For example (for each possible grammar): 
        Cream, right, Red, 90, 0, 0. 
        Square Cream Red
        Triangle Cream clockwise Red
            
        You should ONLY RESPOND WITH THE MOVE IN ONE OF THE THREE GRAMMAR FORMATS. 
    """
    return move_extraction_system_prompt

def get_reasoning_prompt() -> str:
    return "You are currently extracting ONLY the reasoning behind the first move from a list of suggested moves. No need for any text beside the reasoning in the response you'll provide."

def get_move_piece_message(objective : str) -> Message:

    game_logic = {"type": "text", "text":"""Reference Information about the game: 
        You and the human user are playing a tangram game, arranging the pieces to form an objective shape. 
        The pieces are named by their colors: Red, Purple, Yellow, Green, Blue, Cream, and Brown.
        Red and Cream are two large triangles, Yellow and green are two small triangles, Blue is a medium triangle, Purple is a small square, Brown is a tilted parallelogram.
        We consider 0 degrees of rotation the triangles with their hypotenuse facing down, and the square in the square position (so the diamond shape corresponds to 45 degrees of rotation)
        Example logical plays: Matching shapes can allow new larger shapes to appear, uniting two triangles of the same size by their Hypotenuse creates a square of that size in the location or a diamond (can be used as a circle) shape if the triangles are angled by 45 degrees. The Purple Square or a square created of 2 triangles can serve to form many things like heads, bodies, bases of structures. two triangles can also form a larger triangle when combined by their cathetus green and yellow can usually be used together or to fill similar objectives this could be used to make a another medium sized triangle like blue if used with yellow and green.
        It often makes sense to use pieces of the same shape to furfil similar objectives, for example if theres 2 arms, it makes sense to use similar pieces for each.
        """}

    prompt_text = f"""You are an AI-Player helping the Human Player arrange Tangram Pieces in a board in order to create {objective}. 
		A move involves moving one of the tangram pieces on the board or placing a piece on the board from the piece drawer. 

		NEVER use a piece in the drawer as a reference in any of the following
		
		You will receive the current game state in an image format, an image showing the state of the piece drawer, 
		a dictionary specifying the current rotation value of each piece, the full chat history between you (you're the AI) and the player 
		and an history of all played moves, by the player and the AI.  

		After analysing the given image of the state you should suggest your moves in one of the following ways:
		
		You can describe a relative position, done in relation to pieces already placed on the board by indicating which side 
		(right, left, top, bottom, top-right, top-left, bottom-right, bottom-left) of them the piece to be moved should be placed. 
		A move can be done in relation to a reference piece or more.
		You can rotate a piece rotate in a move, always try to describe move rotation in terms of explicit degrees to add, 
		avoid using phrases which require deducting or interpreting the rotation values.
		Example: Place Red to the left of Cream with a 90º rotation.
		This is your main way to play, you should only use the next ones if they match exactly what you consider the best move.
		
		You can suggest to make a Square/diamond shape using a pair of triangles. By moving one of them to next to one already on the board.
		The triangle pair must consist of Cream and Red OR Green and Yellow, since these match in size.
		Whenever suggesting a square creation move, you need to say "Form a Square" and then the triangle that needs to be placed followed by the referenced triangle.
		Example: Form a Square by putting Cream next to Red (note, here red the one that MUST be already on the board, we would be moving cream, you can make this more clear in your replies)
		
		You can suggest to make a larger Triangle by using a pair of smaller triangles. One of them must already be on the board for the move to be valid.
		Since this move leads to two possible positions and may be applied on different orientations, you must indicate if the triangle is placed clockwise or anticlockwise from the reference triangle.
		The triangle pair must also consist of Cream and Red OR Green and Yellow.
		Whenever suggesting a triangle creation move, you need to say "Form a Triangle by placing" and then the triangle piece name to be placed, followed by clockwise or anticlockwise, and then the reference triangle piece name.
		Example: Form a Triangle by placing Cream anticlockwise from Red

		You can simply rotate a piece without moving it, "Just rotate" and then the piece and the rotation you intend for it to have.
		Example: Just rotate Blue 90

		If and only if you believe the objective has already been achieved, that is if you think it looks close enough to the objective then say "Looks finished" followed by a small friendly message to the human player.
		Example: Looks finished: I think this already resembles our objective well. Do you agree?
		
		KEEP IN MIND THE PLAY YOU SHOULD MAKE THE MOST IS THE RELATIVE MOVE
		
		You should always follow the commands and reasoning in the chat history behind the user and the AI. 
		ALWAYS check and respect if you promised something in a recent previous message that wasnt been done yet.
		User commands prevail above AI commands, in case they conflict, as well as newest messages above older ones. 
		Following the chat instructions and considering the state of the game, 
		list all moves that should be done in order to create {objective}, providing explanations for each one."""
    
    system_message = {"role" : "system", "content":  [game_logic, { "type": "text", "text" : prompt_text} ]}
    return system_message
        

class Tangram(OpenAITask):
    

    def get_system_prompt(self, objective: str, hasImage: bool = False) -> str:
        """Generate response endpoint:
        generate the response based on given prompt and store the conversation
        in the history of the session (based on the session_id cookie)
        """

        system_prompt = f"""Your are working with a user to solve some task with a tangram puzzle that consists only of two pieces, a small triangle and a square. 
            The stated task is : {objective}
            In each round, you should select one piece and indicate where you want to place it. 
            You will be provided an image with the current placement of all available pieces, no other pieces are available.py
            You might also get some comment by the user on their move.
            If you decide, that the task is fullfilled, tell the user.
            Be brief in your instruction. Instruct the user one step at a time - move one piece in one turn.
            """
        return system_prompt

    def process_model_answer_openAI(self, answer: ModelResponse) -> TaskDataResponse:
        # Again, we ignore the potential image here...
        return TaskDataResponse(text=answer.text)

    def generate_model_request_openAI(self, request: OpenAIBasedDataRequest) -> OpenAIBasedRequest:
        """Generate prompt endpoint:
        process pieces' data and plug them into the prompt
        """
        try:
            if request.inputData and request.inputData["target"]:
                target = request.inputData["target"]
                if target == "ai_move":
                    system_message = get_move_piece_message(request.objective)
                elif target == "extract_move":
                    system_message = { "role" : "system", "content" : get_move_extraction_prompt(request.inputData["figures_names"], request.inputData["possible_directions"]) }
                elif target == "get_reasoning":
                    system_message = { "role" : "system", "content" : get_reasoning_prompt() }
                elif target == "chat":
                    system_message = get_chat_prompt(request.objective)
                else:
                    logger.error(f"Invalid target {target}")
                    raise HTTPException(400, "Input target type!")
            else:
                logger.error(request)
                raise HTTPException(400, "Input target type!")
        except Exception as e:
            logger.error(e)
            raise HTTPException(400, "Input data invalid!")

        messages = [system_message]
        messages.extend(request.userMessages)
        return OpenAIBasedRequest(messages=messages)
        

    def get_requirements(self) -> TaskRequirements:
        return TaskRequirements(needs_text=True, needs_image=True)
