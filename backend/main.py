from fastapi import FastAPI
from contextlib import asynccontextmanager
from auth import router as auth_router
from routers.payment_methods import router as pm_router
from routers.transactions import router as transactions_router
from database import engine
from models import Base

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Cria as tabelas no banco de dados se não existirem
    try:
        Base.metadata.create_all(bind=engine)
        print("Tabelas do banco verificadas/criadas com sucesso pelo SQLAlchemy.")
    except Exception as e:
        print(f"⚠️ Aviso: Não foi possível conectar ao banco de dados no momento da inicialização. Detalhes: {e}")
    yield

app = FastAPI(
    title="Financer.IA API", 
    description="AI-Powered Personal Financial Advisor",
    lifespan=lifespan
)

app.include_router(auth_router, tags=["auth"])
app.include_router(pm_router)
app.include_router(transactions_router)

@app.get("/")
def read_root():
    return {"message": "Bem-vindo à API do Financer.IA"}
