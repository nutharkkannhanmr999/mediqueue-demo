from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Boolean, ForeignKey, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta
from typing import Optional, List
import jwt
import bcrypt
import os
import enum

# ── App Setup ──────────────────────────────────────────────────
app = FastAPI(title="Hospital Queue Management API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SECRET_KEY = os.getenv("SECRET_KEY", "hospital-queue-secret-2024")
ALGORITHM = "HS256"
TOKEN_EXPIRE_HOURS = 24

# ── Database ───────────────────────────────────────────────────
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./hospital.db")
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
security = HTTPBearer(auto_error=False)


# ── Enums ──────────────────────────────────────────────────────
class UserRole(str, enum.Enum):
    patient = "patient"
    doctor = "doctor"
    admin = "admin"

class TokenStatus(str, enum.Enum):
    waiting = "waiting"
    called = "called"
    completed = "completed"
    skipped = "skipped"

class QueueStatus(str, enum.Enum):
    active = "active"
    paused = "paused"


# ── Models ─────────────────────────────────────────────────────
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, nullable=True)
    password_hash = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.patient)
    created_at = Column(DateTime, default=datetime.utcnow)
    tokens = relationship("QueueToken", back_populates="patient")


class QueueToken(Base):
    __tablename__ = "queue_tokens"
    id = Column(Integer, primary_key=True, index=True)
    token_number = Column(Integer, nullable=False)
    patient_id = Column(Integer, ForeignKey("users.id"))
    patient_name = Column(String, nullable=False)
    status = Column(Enum(TokenStatus), default=TokenStatus.waiting)
    created_at = Column(DateTime, default=datetime.utcnow)
    called_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    notes = Column(String, nullable=True)
    patient = relationship("User", back_populates="tokens")


class QueueState(Base):
    __tablename__ = "queue_state"
    id = Column(Integer, primary_key=True, index=True)
    status = Column(Enum(QueueStatus), default=QueueStatus.active)
    current_token = Column(Integer, default=0)
    next_token_number = Column(Integer, default=1)
    last_updated = Column(DateTime, default=datetime.utcnow)


Base.metadata.create_all(bind=engine)


# ── Pydantic Schemas ───────────────────────────────────────────
class RegisterRequest(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    password: str
    role: Optional[UserRole] = UserRole.patient

class LoginRequest(BaseModel):
    email: str
    password: str

class BookTokenRequest(BaseModel):
    notes: Optional[str] = None

class TokenOut(BaseModel):
    id: int
    token_number: int
    patient_name: str
    status: TokenStatus
    created_at: datetime
    called_at: Optional[datetime]
    completed_at: Optional[datetime]
    notes: Optional[str]
    class Config:
        from_attributes = True

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str]
    role: UserRole
    created_at: datetime
    class Config:
        from_attributes = True

class QueueStateOut(BaseModel):
    status: QueueStatus
    current_token: int
    next_token_number: int
    last_updated: datetime
    class Config:
        from_attributes = True

class QueueInfoOut(BaseModel):
    state: QueueStateOut
    waiting_count: int
    tokens: List[TokenOut]


# ── Helpers ────────────────────────────────────────────────────
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())

def create_jwt(user_id: int, role: str) -> str:
    payload = {
        "sub": str(user_id),
        "role": role,
        "exp": datetime.utcnow() + timedelta(hours=TOKEN_EXPIRE_HOURS)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def decode_jwt(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    payload = decode_jwt(credentials.credentials)
    user = db.query(User).filter(User.id == int(payload["sub"])).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

def require_role(*roles):
    def check(current_user: User = Depends(get_current_user)):
        if current_user.role not in roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return current_user
    return check

def get_or_create_queue_state(db: Session) -> QueueState:
    state = db.query(QueueState).first()
    if not state:
        state = QueueState()
        db.add(state)
        db.commit()
        db.refresh(state)
    return state


# ── Auth Routes ────────────────────────────────────────────────
@app.post("/auth/register")
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == req.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        name=req.name,
        email=req.email,
        phone=req.phone,
        password_hash=hash_password(req.password),
        role=req.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_jwt(user.id, user.role)
    return {"token": token, "user": UserOut.from_orm(user)}

@app.post("/auth/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_jwt(user.id, user.role)
    return {"token": token, "user": UserOut.from_orm(user)}

@app.get("/auth/me")
def me(current_user: User = Depends(get_current_user)):
    return UserOut.from_orm(current_user)


# ── Patient Routes ─────────────────────────────────────────────
@app.post("/tokens/book")
def book_token(req: BookTokenRequest, current_user: User = Depends(require_role(UserRole.patient)), db: Session = Depends(get_db)):
    existing = db.query(QueueToken).filter(
        QueueToken.patient_id == current_user.id,
        QueueToken.status == TokenStatus.waiting
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="You already have an active token")

    state = get_or_create_queue_state(db)
    token_num = state.next_token_number
    state.next_token_number += 1
    state.last_updated = datetime.utcnow()

    qt = QueueToken(
        token_number=token_num,
        patient_id=current_user.id,
        patient_name=current_user.name,
        notes=req.notes,
    )
    db.add(qt)
    db.commit()
    db.refresh(qt)
    return TokenOut.from_orm(qt)

@app.get("/tokens/my")
def my_tokens(current_user: User = Depends(require_role(UserRole.patient)), db: Session = Depends(get_db)):
    tokens = db.query(QueueToken).filter(QueueToken.patient_id == current_user.id).order_by(QueueToken.created_at.desc()).all()
    return [TokenOut.from_orm(t) for t in tokens]

@app.get("/tokens/status/{token_number}")
def token_status(token_number: int, db: Session = Depends(get_db)):
    qt = db.query(QueueToken).filter(QueueToken.token_number == token_number).first()
    if not qt:
        raise HTTPException(status_code=404, detail="Token not found")
    state = get_or_create_queue_state(db)
    waiting_before = db.query(QueueToken).filter(
        QueueToken.status == TokenStatus.waiting,
        QueueToken.token_number < token_number
    ).count()
    avg_minutes = 5
    return {
        "token": TokenOut.from_orm(qt),
        "current_token": state.current_token,
        "queue_status": state.status,
        "position": waiting_before + 1 if qt.status == TokenStatus.waiting else 0,
        "estimated_wait_minutes": waiting_before * avg_minutes,
    }


# ── Queue (Public) ─────────────────────────────────────────────
@app.get("/queue/status")
def queue_status(db: Session = Depends(get_db)):
    state = get_or_create_queue_state(db)
    waiting = db.query(QueueToken).filter(QueueToken.status == TokenStatus.waiting).count()
    return {
        "current_token": state.current_token,
        "queue_status": state.status,
        "waiting_count": waiting,
        "next_token_number": state.next_token_number,
    }


# ── Doctor Routes ──────────────────────────────────────────────
@app.get("/doctor/queue")
def doctor_queue(current_user: User = Depends(require_role(UserRole.doctor, UserRole.admin)), db: Session = Depends(get_db)):
    state = get_or_create_queue_state(db)
    tokens = db.query(QueueToken).filter(
        QueueToken.status.in_([TokenStatus.waiting, TokenStatus.called])
    ).order_by(QueueToken.token_number).all()
    waiting_count = sum(1 for t in tokens if t.status == TokenStatus.waiting)
    return QueueInfoOut(
        state=QueueStateOut.from_orm(state),
        waiting_count=waiting_count,
        tokens=[TokenOut.from_orm(t) for t in tokens]
    )

@app.post("/doctor/call-next")
def call_next(current_user: User = Depends(require_role(UserRole.doctor, UserRole.admin)), db: Session = Depends(get_db)):
    state = get_or_create_queue_state(db)
    if state.status == QueueStatus.paused:
        raise HTTPException(status_code=400, detail="Queue is paused")

    # Mark current called token as completed
    called = db.query(QueueToken).filter(QueueToken.status == TokenStatus.called).first()
    if called:
        called.status = TokenStatus.completed
        called.completed_at = datetime.utcnow()

    # Get next waiting token
    next_token = db.query(QueueToken).filter(
        QueueToken.status == TokenStatus.waiting
    ).order_by(QueueToken.token_number).first()

    if not next_token:
        state.current_token = 0
        db.commit()
        return {"message": "No more patients in queue", "current_token": 0}

    next_token.status = TokenStatus.called
    next_token.called_at = datetime.utcnow()
    state.current_token = next_token.token_number
    state.last_updated = datetime.utcnow()
    db.commit()
    db.refresh(next_token)
    return {"message": f"Called token {next_token.token_number}", "token": TokenOut.from_orm(next_token)}

@app.post("/doctor/pause")
def pause_queue(current_user: User = Depends(require_role(UserRole.doctor, UserRole.admin)), db: Session = Depends(get_db)):
    state = get_or_create_queue_state(db)
    state.status = QueueStatus.paused
    state.last_updated = datetime.utcnow()
    db.commit()
    return {"message": "Queue paused", "status": "paused"}

@app.post("/doctor/resume")
def resume_queue(current_user: User = Depends(require_role(UserRole.doctor, UserRole.admin)), db: Session = Depends(get_db)):
    state = get_or_create_queue_state(db)
    state.status = QueueStatus.active
    state.last_updated = datetime.utcnow()
    db.commit()
    return {"message": "Queue resumed", "status": "active"}

@app.post("/doctor/skip/{token_number}")
def skip_token(token_number: int, current_user: User = Depends(require_role(UserRole.doctor, UserRole.admin)), db: Session = Depends(get_db)):
    qt = db.query(QueueToken).filter(QueueToken.token_number == token_number).first()
    if not qt:
        raise HTTPException(status_code=404, detail="Token not found")
    qt.status = TokenStatus.skipped
    db.commit()
    return {"message": f"Token {token_number} skipped"}


# ── Admin Routes ───────────────────────────────────────────────
@app.get("/admin/patients")
def all_patients(current_user: User = Depends(require_role(UserRole.admin)), db: Session = Depends(get_db)):
    patients = db.query(User).filter(User.role == UserRole.patient).order_by(User.created_at.desc()).all()
    return [UserOut.from_orm(p) for p in patients]

@app.get("/admin/tokens")
def all_tokens(current_user: User = Depends(require_role(UserRole.admin)), db: Session = Depends(get_db)):
    tokens = db.query(QueueToken).order_by(QueueToken.created_at.desc()).all()
    return [TokenOut.from_orm(t) for t in tokens]

@app.post("/admin/reset-queue")
def reset_queue(current_user: User = Depends(require_role(UserRole.admin)), db: Session = Depends(get_db)):
    db.query(QueueToken).delete()
    state = get_or_create_queue_state(db)
    state.current_token = 0
    state.next_token_number = 1
    state.status = QueueStatus.active
    state.last_updated = datetime.utcnow()
    db.commit()
    return {"message": "Queue reset successfully"}

@app.get("/admin/stats")
def stats(current_user: User = Depends(require_role(UserRole.admin)), db: Session = Depends(get_db)):
    total_patients = db.query(User).filter(User.role == UserRole.patient).count()
    total_tokens = db.query(QueueToken).count()
    waiting = db.query(QueueToken).filter(QueueToken.status == TokenStatus.waiting).count()
    completed = db.query(QueueToken).filter(QueueToken.status == TokenStatus.completed).count()
    called = db.query(QueueToken).filter(QueueToken.status == TokenStatus.called).count()
    skipped = db.query(QueueToken).filter(QueueToken.status == TokenStatus.skipped).count()
    state = get_or_create_queue_state(db)
    return {
        "total_patients": total_patients,
        "total_tokens": total_tokens,
        "waiting": waiting,
        "completed": completed,
        "called": called,
        "skipped": skipped,
        "current_token": state.current_token,
        "queue_status": state.status,
    }

@app.get("/")
def root():
    return {"message": "Hospital Queue Management API", "version": "1.0.0"}
