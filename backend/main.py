from fastapi import FastAPI
from auth import router as auth_router

app = FastAPI(
    title="Financer.IA API", 
    description="AI-Powered Personal Financial Advisor",
)

app.include_router(auth_router, tags=["auth"])

@app.get("/")
def read_root():
    return {"message": "Bem-vindo à API do Financer.IA"}
