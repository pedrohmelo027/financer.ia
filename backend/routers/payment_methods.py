from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import User, PaymentMethod
from dependencies import get_current_user
from schemas import PaymentMethodCreate, PaymentMethodResponse

router = APIRouter(prefix="/payment-methods", tags=["payment_methods"])

@router.post("/", response_model=PaymentMethodResponse)
def create_payment_method(
    payment_method: PaymentMethodCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    new_method = PaymentMethod(
        user_id=current_user.id,
        name=payment_method.name,
        type=payment_method.type,
        bank=payment_method.bank
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
