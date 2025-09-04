from pydantic import BaseModel
#from typing import List, Optional

class Preferences(BaseModel):
    user_input: str