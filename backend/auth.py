from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session
from database import get_db
from models import User
from security import verify_password, create_access_token, get_password_hash, encrypt_text

router = APIRouter()

class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    hobbies: Optional[str] = None
    goals: Optional[str] = None
    bio: Optional[str] = None

@router.post("/login", response_model=dict)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Endpoint para autenticação de usuários usando SQLAlchemy.
    """
    user = db.query(User).filter(User.email == form_data.username).first()
    
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Gera o token customizado
    access_token = create_access_token(data={"sub": str(user.id), "email": user.email})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "usuario_id": str(user.id)
    }

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(user: UserCreate, db: Session = Depends(get_db)):
    """
    Endpoint para criar um novo usuário com SQLAlchemy.
    Os campos adicionais do perfil são criptografados antes de salvar.
    """
    # Verifica se e-mail já existe
    existing = db.query(User).filter(User.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="E-mail já cadastrado")
        
    hashed_password = get_password_hash(user.password)
    
    new_user = User(
        name=user.name,
        email=user.email,
        password_hash=hashed_password,
        hobbies=encrypt_text(user.hobbies) if user.hobbies else None,
        goals=encrypt_text(user.goals) if user.goals else None,
        bio=encrypt_text(user.bio) if user.bio else None
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Criar um método de pagamento padrão (ex: "Dinheiro / Padrão")
    from models import PaymentMethod
    default_pm = PaymentMethod(
        user_id=new_user.id,
        name="Conta Padrão",
        type="Carteira"
    )
    db.add(default_pm)
    db.commit()
    
    return {"message": "Usuário criado com sucesso", "usuario_id": str(new_user.id)}
