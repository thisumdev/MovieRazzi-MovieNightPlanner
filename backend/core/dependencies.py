from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from auth.jwt_handler import decode_access_token

# tokenUrl should match the login path
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

def get_current_user(token: str = Depends(oauth2_scheme)) -> str:
    username = decode_access_token(token)
    if not username:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return username


