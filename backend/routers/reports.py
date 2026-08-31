from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import extract
from typing import Optional
from database import get_db
from models import User, Transaction, PaymentMethod
from dependencies import get_current_user
from schemas import ReportSummaryResponse, PaymentMethodSummary

router = APIRouter(prefix="/reports", tags=["reports"])

@router.get("/summary", response_model=ReportSummaryResponse)
def get_report_summary(
    month: Optional[int] = Query(None, description="Mês (1-12)"),
    year: Optional[int] = Query(None, description="Ano (ex: 2026)"),
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    # 1. Fetch ALL payment methods strictly for the CURRENT USER
    user_methods = db.query(PaymentMethod).filter(PaymentMethod.user_id == current_user.id).all()
    
    # 2. Fetch transactions strictly for the CURRENT USER, with optional filters
    query = db.query(Transaction).filter(Transaction.user_id == current_user.id)
    
    if year:
        query = query.filter(extract('year', Transaction.transaction_date) == year)
    if month:
        query = query.filter(extract('month', Transaction.transaction_date) == month)
        
    transactions = query.all()
    
    total_incomes = 0.0
    total_expenses = 0.0
    
    # Initialize stats for every payment method the user owns (even if they have 0 transactions)
    pm_stats = {
        method.id: {
            "method_name": method.name,
            "method_type": method.type,
            "account_name": method.account.name if method.account else "Sem Conta",
            "total_incomes": 0.0,
            "total_expenses": 0.0,
            "incomes_count": 0,
            "expenses_count": 0
        }
        for method in user_methods
    }
    
    current_balance = 0.0
    today = datetime.date.today()
    
    # Calculate time-based summaries
    monthly_stats = {}
    weekly_stats = {}
    daily_stats = {}
    
    # Aggregate transactions
    for t in transactions:
        amount = float(t.amount)
        pm_id = t.payment_method_id
        
        d = t.transaction_date
        # Monthly aggregation
        month_str = d.strftime("%m/%Y")
        
        # Weekly aggregation: "Semana X - MM/YYYY" (where X is the week of the month, roughly 1-5)
        week_of_month = (d.day - 1) // 7 + 1
        week_str = f"Semana {week_of_month} - {month_str}"
        
        # Daily aggregation
        day_str = d.strftime("%d/%m/%Y")
        
        if month_str not in monthly_stats:
            monthly_stats[month_str] = {"period": month_str, "total_incomes": 0.0, "total_expenses": 0.0}
            
        if week_str not in weekly_stats:
            weekly_stats[week_str] = {"period": week_str, "total_incomes": 0.0, "total_expenses": 0.0}
            
        if day_str not in daily_stats:
            daily_stats[day_str] = {"period": day_str, "total_incomes": 0.0, "total_expenses": 0.0}
        
        # Security fallback: only aggregate if the payment method actually belongs to this user
        if pm_id in pm_stats:
            t_type = t.type.upper()
            if t_type == "INCOME" or t_type == "RECEITA":
                total_incomes += amount
                if d <= today:
                    current_balance += amount
                pm_stats[pm_id]["total_incomes"] += amount
                pm_stats[pm_id]["incomes_count"] += 1
                monthly_stats[month_str]["total_incomes"] += amount
                weekly_stats[week_str]["total_incomes"] += amount
                daily_stats[day_str]["total_incomes"] += amount
            elif t_type == "EXPENSE" or t_type == "DESPESA":
                total_expenses += amount
                if d <= today:
                    current_balance -= amount
                pm_stats[pm_id]["total_expenses"] += amount
                pm_stats[pm_id]["expenses_count"] += 1
                monthly_stats[month_str]["total_expenses"] += amount
                weekly_stats[week_str]["total_expenses"] += amount
                daily_stats[day_str]["total_expenses"] += amount
    
    
    # Build the final response list
    payment_methods_summary = []
    for pm_id, stats in pm_stats.items():
        payment_methods_summary.append(
            PaymentMethodSummary(
                method_id=pm_id,
                method_name=stats["method_name"],
                method_type=stats["method_type"],
                account_name=stats["account_name"],
                total_incomes=stats["total_incomes"],
                total_expenses=stats["total_expenses"],
                incomes_count=stats["incomes_count"],
                expenses_count=stats["expenses_count"]
            )
        )
        
    monthly_summary = list(monthly_stats.values())
    monthly_summary.sort(key=lambda x: x["period"].split("/")[1] + x["period"].split("/")[0])
    
    weekly_summary = list(weekly_stats.values())
    weekly_summary.sort(key=lambda x: x["period"][-4:] + x["period"][-7:-5] + x["period"].split(" ")[1])
    
    daily_summary = list(daily_stats.values())
    daily_summary.sort(key=lambda x: x["period"].split("/")[2] + x["period"].split("/")[1] + x["period"].split("/")[0])
            
    return ReportSummaryResponse(
        total_incomes=total_incomes,
        total_expenses=total_expenses,
        current_balance=current_balance,
        transactions_count=len(transactions),
        payment_methods_summary=payment_methods_summary,
        monthly_summary=monthly_summary,
        weekly_summary=weekly_summary,
        daily_summary=daily_summary
    )
