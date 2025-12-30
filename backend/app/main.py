from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import (
    equipamentos,
    clientes,
    motoristas,
    contratos,
    plano_contas,
    historicos,
    centros_custo,
    viagens,
    abastecimentos,
    manutencoes,
    lancamentos,
)

app = FastAPI(title=settings.APP_NAME, debug=settings.DEBUG)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar routers - Gestão
app.include_router(equipamentos.router)
app.include_router(clientes.router)
app.include_router(motoristas.router)
app.include_router(contratos.router)

# Registrar routers - Operacional
app.include_router(viagens.router)
app.include_router(abastecimentos.router)
app.include_router(manutencoes.router)

# Registrar routers - Contábil
app.include_router(plano_contas.router)
app.include_router(historicos.router)
app.include_router(centros_custo.router)
app.include_router(lancamentos.router)


@app.get("/")
def root():
    return {
        "message": "AJR System API",
        "version": "1.0.0",
        "status": "online"
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}
