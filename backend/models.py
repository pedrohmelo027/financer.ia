import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, DECIMAL, Date, ForeignKey, Uuid
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    
    # Textos criptografados
    hobbies = Column(Text, nullable=True)
    goals = Column(Text, nullable=True)
    bio = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    accounts = relationship("Account", back_populates="user")
    payment_methods = relationship("PaymentMethod", back_populates="user")
    transactions = relationship("Transaction", back_populates="user")


class Account(Base):
    __tablename__ = "accounts"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(Uuid(as_uuid=True), ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="accounts")
    payment_methods = relationship("PaymentMethod", back_populates="account")


class PaymentMethod(Base):
    __tablename__ = "payment_methods"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(Uuid(as_uuid=True), ForeignKey("users.id"), nullable=False)
    account_id = Column(Uuid(as_uuid=True), ForeignKey("accounts.id"), nullable=False)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="payment_methods")
    account = relationship("Account", back_populates="payment_methods")
    transactions = relationship("Transaction", back_populates="payment_method")


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(Uuid(as_uuid=True), ForeignKey("users.id"), nullable=False)
    payment_method_id = Column(Uuid(as_uuid=True), ForeignKey("payment_methods.id"), nullable=False)
    type = Column(String, nullable=False)
    amount = Column(DECIMAL, nullable=False)
    transaction_date = Column(Date, nullable=False)
    category = Column(String, nullable=False)
    
    # Texto criptografado
    description = Column(Text, nullable=True)

    user = relationship("User", back_populates="transactions")
    payment_method = relationship("PaymentMethod", back_populates="transactions")
