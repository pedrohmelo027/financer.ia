from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime
from uuid import UUID

# --- Accounts ---
class AccountBase(BaseModel):
    name: str

class AccountCreate(AccountBase):
    pass

class AccountResponse(AccountBase):
    id: UUID
    user_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

# --- Payment Methods ---
class PaymentMethodBase(BaseModel):
    account_id: UUID
    name: str
    type: str

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

# --- Reports ---
class PaymentMethodSummary(BaseModel):
    method_id: UUID
    method_name: str
    method_type: str
    account_name: str
    total_incomes: float
    total_expenses: float
    incomes_count: int
    expenses_count: int

class ReportSummaryResponse(BaseModel):
    total_incomes: float
    total_expenses: float
    current_balance: float
    transactions_count: int
    payment_methods_summary: List[PaymentMethodSummary]

