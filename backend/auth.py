from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from database import supabase
from security import verify_password, create_access_token, get_password_hash

router = APIRouter()

class UserCreate(BaseModel):
    name: str
    email: str
    password: str

@router.post("/login", response_model=dict)
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Endpoint para autenticação de usuários via SDK do Supabase.
    Busca o usuário pelo email, verifica o hash da senha e retorna um token JWT customizado.
    """
    # Buscando o usuário na tabela 'users' pelo e-mail usando o SDK do Supabase
    response = supabase.table("users").select("*").eq("email", form_data.username).execute()
    
    users = response.data
    if not users:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Supomos que o email seja único, então pegamos o primeiro resultado
    user = users[0]
        
    if not verify_password(form_data.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Gera o token customizado
    access_token = create_access_token(data={"sub": str(user["id"]), "email": user["email"]})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "usuario_id": str(user["id"])
    }

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(user: UserCreate):
    """
    Endpoint para criar um novo usuário.
    Gera o hash bcrypt da senha e salva nativamente no Supabase.
    """
    # Verifica se e-mail já existe
    existing = supabase.table("users").select("id").eq("email", user.email).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="E-mail já cadastrado")
        
    hashed_password = get_password_hash(user.password)
    new_user = {
        "name": user.name,
        "email": user.email,
        "password_hash": hashed_password
    }
    
    response = supabase.table("users").insert(new_user).execute()
    
    if not response.data:
        raise HTTPException(status_code=500, detail="Erro ao criar usuário")
        
    created_user = response.data[0]
    return {"message": "Usuário criado com sucesso", "usuario_id": created_user["id"]}

