from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import extract
from typing import List, Optional
from database import get_db
from models import User, Transaction, PaymentMethod
from dependencies import get_current_user
from schemas import TransactionCreate, TransactionResponse
from security import encrypt_text, decrypt_text

router = APIRouter(prefix="/transactions", tags=["transactions"])

@router.post("/", response_model=TransactionResponse)
def create_transaction(
    transaction: TransactionCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    # Verifica se o payment_method pertence ao usuário
    payment_method = db.query(PaymentMethod).filter(
        PaymentMethod.id == transaction.payment_method_id,
        PaymentMethod.user_id == current_user.id
    ).first()
    
    if not payment_method:
        raise HTTPException(status_code=400, detail="Método de pagamento inválido ou não pertence ao usuário.")

    new_transaction = Transaction(
        user_id=current_user.id,
        payment_method_id=transaction.payment_method_id,
        type=transaction.type,
        amount=transaction.amount,
        transaction_date=transaction.transaction_date,
        category=transaction.category,
        # Criptografa a descrição antes de salvar no banco
        description=encrypt_text(transaction.description) if transaction.description else None
    )
    
    db.add(new_transaction)
    db.commit()
    db.refresh(new_transaction)
    
    # Descriptografa apenas para retornar na resposta imediatamente após a criação
    new_transaction.description = transaction.description
    return new_transaction

@router.get("/", response_model=List[TransactionResponse])
def get_transactions(
    month: Optional[int] = Query(None, description="Mês (1-12)"),
    year: Optional[int] = Query(None, description="Ano (ex: 2026)"),
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    query = db.query(Transaction).filter(Transaction.user_id == current_user.id)
    
    if year:
        query = query.filter(extract('year', Transaction.transaction_date) == year)
    if month:
        query = query.filter(extract('month', Transaction.transaction_date) == month)
        
    transactions = query.all()
    
    # Descriptografa a descrição antes de enviar pro cliente
    for t in transactions:
        if t.description:
            try:
                t.description = decrypt_text(t.description)
            except Exception:
                t.description = "[Erro ao descriptografar]"
                
    return transactions
