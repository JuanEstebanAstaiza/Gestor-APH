from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from src.config import settings
import src.models.user  # noqa: F401
import src.models.refresh_token  # noqa: F401
import src.models.visitor  # noqa: F401
import src.models.authorization  # noqa: F401
import src.models.census  # noqa: F401
import src.models.resident_asset  # noqa: F401
import src.models.resident_file  # noqa: F401
import src.models.asset  # noqa: F401
import src.models.document  # noqa: F401
import src.models.communication  # noqa: F401
import src.models.finance  # noqa: F401
import src.models.reservation  # noqa: F401
import src.models.assembly  # noqa: F401
import src.models.provider  # noqa: F401
import src.models.activity_log  # noqa: F401
from src.routers import auth, users, visitors, authorizations, census, assets, documents, categories, audit, finance, pqrs, faq, circulars, communications, reservations, assemblies, tasks, providers, maintenance


engine = create_engine(settings.database_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Ensure all mappers are configured before any query
from src.models import Base
Base.registry.configure()


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield


app = FastAPI(
    title="Gestor APH",
    description="Sistema de gestión de copropiedad (Propiedad Horizontal)",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(visitors.router, prefix="/api/visitors", tags=["visitors"])
app.include_router(authorizations.router, prefix="/api/authorizations", tags=["authorizations"])
app.include_router(census.router, prefix="/api/census", tags=["census"])
app.include_router(assets.router, prefix="/api/assets", tags=["assets"])
app.include_router(documents.router, prefix="/api/documents", tags=["documents"])
app.include_router(categories.router, prefix="/api/categories", tags=["categories"])
app.include_router(audit.router, prefix="/api/audit", tags=["audit"])
app.include_router(finance.router, prefix="/api/finance", tags=["finance"])
app.include_router(pqrs.router, prefix="/api/pqrs", tags=["pqrs"])
app.include_router(faq.router, prefix="/api/faq", tags=["faq"])
app.include_router(circulars.router, prefix="/api/circulars", tags=["circulars"])
app.include_router(communications.router, prefix="/api/communications", tags=["communications"])
app.include_router(reservations.router, prefix="/api/reservations", tags=["reservations"])
app.include_router(assemblies.router, prefix="/api/assemblies", tags=["assemblies"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["tasks"])
app.include_router(providers.router, prefix="/api/providers", tags=["providers"])
app.include_router(maintenance.router, prefix="/api/maintenance", tags=["maintenance"])


@app.get("/health")
def health_check():
    return {"status": "ok"}
