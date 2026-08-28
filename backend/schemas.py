from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime
from uuid import UUID

# --- Payment Methods ---
class PaymentMethodBase(BaseModel):
    name: str
    type: str
    bank: Optional[str] = None

class PaymentMethodCreate(PaymentMethodBase):
    pass

class PaymentMethodResponse(PaymentMethodBase):
    id: UUID
    user_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

# --- Transactions ---
class TransactionBase(BaseModel):
    payment_method_id: UUID
    type: str
    amount: float
    transaction_date: date
    category: str
    description: Optional[str] = None

class TransactionCreate(TransactionBase):
    pass

class TransactionResponse(TransactionBase):
    id: UUID
    user_id: UUID
    
    class Config:
        from_attributes = True
