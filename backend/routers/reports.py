from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import User, Transaction, PaymentMethod
from dependencies import get_current_user
from schemas import ReportSummaryResponse, PaymentMethodSummary

router = APIRouter(prefix="/reports", tags=["reports"])

@router.get("/summary", response_model=ReportSummaryResponse)
def get_report_summary(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    # 1. Fetch ALL payment methods strictly for the CURRENT USER
    user_methods = db.query(PaymentMethod).filter(PaymentMethod.user_id == current_user.id).all()
    
    # 2. Fetch ALL transactions strictly for the CURRENT USER
    transactions = db.query(Transaction).filter(Transaction.user_id == current_user.id).all()
    
    total_incomes = 0.0
    total_expenses = 0.0
    
    # Initialize stats for every payment method the user owns (even if they have 0 transactions)
    pm_stats = {
        method.id: {
            "method_name": method.name,
            "method_type": method.type,
            "bank": method.bank,
            "total_incomes": 0.0,
            "total_expenses": 0.0,
            "incomes_count": 0,
            "expenses_count": 0
        }
        for method in user_methods
    }
    
    # Aggregate transactions
    for t in transactions:
        amount = float(t.amount)
        pm_id = t.payment_method_id
        
        # Security fallback: only aggregate if the payment method actually belongs to this user
        if pm_id in pm_stats:
            t_type = t.type.upper()
            if t_type == "INCOME" or t_type == "RECEITA":
                total_incomes += amount
                pm_stats[pm_id]["total_incomes"] += amount
                pm_stats[pm_id]["incomes_count"] += 1
            elif t_type == "EXPENSE" or t_type == "DESPESA":
                total_expenses += amount
                pm_stats[pm_id]["total_expenses"] += amount
                pm_stats[pm_id]["expenses_count"] += 1
            
    current_balance = total_incomes - total_expenses
    
    # Build the final response list
    payment_methods_summary = []
    for pm_id, stats in pm_stats.items():
        payment_methods_summary.append(
            PaymentMethodSummary(
                method_id=pm_id,
                method_name=stats["method_name"],
                method_type=stats["method_type"],
                bank=stats["bank"],
                total_incomes=stats["total_incomes"],
                total_expenses=stats["total_expenses"],
                incomes_count=stats["incomes_count"],
                expenses_count=stats["expenses_count"]
            )
        )
            
    return ReportSummaryResponse(
        total_incomes=total_incomes,
        total_expenses=total_expenses,
        current_balance=current_balance,
        transactions_count=len(transactions),
        payment_methods_summary=payment_methods_summary
    )
