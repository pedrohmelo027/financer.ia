from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import User, PaymentMethod, Account
from dependencies import get_current_user
from schemas import PaymentMethodCreate, PaymentMethodResponse

router = APIRouter(prefix="/payment-methods", tags=["payment_methods"])

@router.post("/", response_model=PaymentMethodResponse)
def create_payment_method(
    payment_method: PaymentMethodCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    # Verify the account belongs to the current user
    account = db.query(Account).filter(
        Account.id == payment_method.account_id,
        Account.user_id == current_user.id
    ).first()
    
    if not account:
        raise HTTPException(status_code=400, detail="Conta inválida ou não pertence ao usuário.")

    new_method = PaymentMethod(
        user_id=current_user.id,
        account_id=payment_method.account_id,
        name=payment_method.name,
        type=payment_method.type
    )
    db.add(new_method)
    db.commit()
    db.refresh(new_method)
    return new_method

@router.get("/", response_model=List[PaymentMethodResponse])
def get_payment_methods(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    return db.query(PaymentMethod).filter(PaymentMethod.user_id == current_user.id).all()
