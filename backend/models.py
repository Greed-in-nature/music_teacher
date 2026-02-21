from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Enum, DECIMAL
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime
import enum

class UserRole(str, enum.Enum):
    STUDENT = "student"
    TEACHER = "teacher"
    ADMIN = "admin"

class AdStatus(str, enum.Enum):
    PENDING = "pending"
    ACTIVE = "active"
    EXPIRED = "expired"
    SUSPENDED = "suspended"

class SubscriptionType(str, enum.Enum):
    FREE = "free"
    PREMIUM = "premium"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=True)
    role = Column(Enum(UserRole), default=UserRole.STUDENT)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Teacher specific fields
    teacher_profile = relationship("TeacherProfile", back_populates="user", uselist=False)
    advertisements = relationship("Advertisement", back_populates="teacher")

class TeacherProfile(Base):
    __tablename__ = "teacher_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    bio_short = Column(String(255), nullable=True)
    bio_long = Column(Text, nullable=True)
    video_url = Column(String(500), nullable=True)
    years_experience = Column(Integer, default=0)
    lesson_price = Column(DECIMAL(10, 2), nullable=True)
    price_currency = Column(String(3), default="HUF")
    teaching_online = Column(Boolean, default=False)
    teaching_at_student = Column(Boolean, default=False)
    teaching_at_teacher = Column(Boolean, default=False)
    subscription_type = Column(Enum(SubscriptionType), default=SubscriptionType.FREE)
    subscription_expires = Column(DateTime, nullable=True)
    
    user = relationship("User", back_populates="teacher_profile")
    instruments = relationship("TeacherInstrument", back_populates="teacher")
    locations = relationship("TeacherLocation", back_populates="teacher")

class Instrument(Base):
    __tablename__ = "instruments"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    name_hu = Column(String(100), nullable=False)
    category = Column(String(50), nullable=False)
    icon = Column(String(50), nullable=True)
    
    teacher_instruments = relationship("TeacherInstrument", back_populates="instrument")

class TeacherInstrument(Base):
    __tablename__ = "teacher_instruments"
    
    id = Column(Integer, primary_key=True, index=True)
    teacher_id = Column(Integer, ForeignKey("teacher_profiles.id"))
    instrument_id = Column(Integer, ForeignKey("instruments.id"))
    level = Column(String(50), default="all")  # beginner, intermediate, advanced, all
    
    teacher = relationship("TeacherProfile", back_populates="instruments")
    instrument = relationship("Instrument", back_populates="teacher_instruments")

class Location(Base):
    __tablename__ = "locations"
    
    id = Column(Integer, primary_key=True, index=True)
    city = Column(String(100), nullable=False)
    district = Column(String(100), nullable=True)
    country = Column(String(100), default="Hungary")
    
    teacher_locations = relationship("TeacherLocation", back_populates="location")

class TeacherLocation(Base):
    __tablename__ = "teacher_locations"
    
    id = Column(Integer, primary_key=True, index=True)
    teacher_id = Column(Integer, ForeignKey("teacher_profiles.id"))
    location_id = Column(Integer, ForeignKey("locations.id"))
    
    teacher = relationship("TeacherProfile", back_populates="locations")
    location = relationship("Location", back_populates="teacher_locations")

class Advertisement(Base):
    __tablename__ = "advertisements"
    
    id = Column(Integer, primary_key=True, index=True)
    teacher_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String(200), nullable=False)
    short_description = Column(String(500), nullable=False)
    long_description = Column(Text, nullable=True)
    instrument_id = Column(Integer, ForeignKey("instruments.id"))
    location_id = Column(Integer, ForeignKey("locations.id"))
    status = Column(Enum(AdStatus), default=AdStatus.PENDING)
    featured = Column(Boolean, default=False)
    views = Column(Integer, default=0)
    contacts = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)
    
    teacher = relationship("User", back_populates="advertisements")
    instrument = relationship("Instrument")
    location = relationship("Location")

class ContactMessage(Base):
    __tablename__ = "contact_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    recipient_id = Column(Integer, ForeignKey("users.id"))
    advertisement_id = Column(Integer, ForeignKey("advertisements.id"), nullable=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=True)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    sender = relationship("User", foreign_keys=[sender_id])
    recipient = relationship("User", foreign_keys=[recipient_id])
    advertisement = relationship("Advertisement")

class Payment(Base):
    __tablename__ = "payments"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    amount = Column(DECIMAL(10, 2), nullable=False)
    currency = Column(String(3), default="HUF")
    payment_type = Column(String(50), nullable=False)  # subscription, featured_ad, commission
    status = Column(String(50), default="pending")  # pending, completed, failed, refunded
    stripe_payment_intent_id = Column(String(255), nullable=True)
    description = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    user = relationship("User")
