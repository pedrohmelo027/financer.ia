from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import User, Account, PaymentMethod
from dependencies import get_current_user
from schemas import AccountCreate, AccountResponse

router = APIRouter(prefix="/accounts", tags=["accounts"])

@router.post("/", response_model=AccountResponse)
def create_account(
    account: AccountCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    new_account = Account(
        user_id=current_user.id,
        name=account.name
    )
    db.add(new_account)
    db.commit()
    db.refresh(new_account)
    return new_account

@router.get("/", response_model=List[AccountResponse])
def get_accounts(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    return db.query(Account).filter(Account.user_id == current_user.id).all()
