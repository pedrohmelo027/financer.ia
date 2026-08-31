import os
from datetime import datetime, timedelta, timezone
import jwt
import bcrypt
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "chave_secreta_super_segura_para_desenvolvimento")
ALGORITHM = "HS256"
# Por padrão expira em 60 minutos, configurável via .env
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60))

def get_password_hash(password: str) -> str:
    """
    Gera o hash unidirecional da senha usando bcrypt.
    """
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifica se a senha em texto plano corresponde ao hash bcrypt.
    """
    return bcrypt.checkpw(
        plain_password.encode('utf-8'),
        hashed_password.encode('utf-8')
    )

def create_access_token(data: dict) -> str:
    """
    Gera o token JWT com expiração configurada em minutos.
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# --- Criptografia Simétrica (Fernet) ---
from cryptography.fernet import Fernet
import base64
import hashlib

# Derivamos uma chave válida pro Fernet a partir do SECRET_KEY
fernet_key_bytes = hashlib.sha256(SECRET_KEY.encode()).digest()
fernet_key = base64.urlsafe_b64encode(fernet_key_bytes)
fernet = Fernet(fernet_key)

def encrypt_text(text: str) -> str:
    if not text:
        return text
    return fernet.encrypt(text.encode('utf-8')).decode('utf-8')

def decrypt_text(encrypted_text: str) -> str:
    if not encrypted_text:
        return encrypted_text
    return fernet.decrypt(encrypted_text.encode('utf-8')).decode('utf-8')
