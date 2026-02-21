from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from decimal import Decimal
from models import UserRole, AdStatus, SubscriptionType

# User schemas
class UserBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    phone: Optional[str] = None

class UserCreate(UserBase):
    password: str
    role: UserRole = UserRole.STUDENT

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: int
    role: UserRole
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Instrument schemas
class InstrumentBase(BaseModel):
    name: str
    name_hu: str
    category: str
    icon: Optional[str] = None

class InstrumentCreate(InstrumentBase):
    pass

class InstrumentResponse(InstrumentBase):
    id: int
    
    class Config:
        from_attributes = True

# Location schemas
class LocationBase(BaseModel):
    city: str
    district: Optional[str] = None
    country: str = "Hungary"

class LocationCreate(LocationBase):
    pass

class LocationResponse(LocationBase):
    id: int
    
    class Config:
        from_attributes = True

# Teacher Profile schemas
class TeacherProfileBase(BaseModel):
    bio_short: Optional[str] = None
    bio_long: Optional[str] = None
    video_url: Optional[str] = None
    years_experience: int = 0
    lesson_price: Optional[Decimal] = None
    price_currency: str = "HUF"
    teaching_online: bool = False
    teaching_at_student: bool = False
    teaching_at_teacher: bool = False

class TeacherProfileCreate(TeacherProfileBase):
    pass

class TeacherProfileResponse(TeacherProfileBase):
    id: int
    user_id: int
    subscription_type: SubscriptionType
    instruments: List[dict] = []
    locations: List[dict] = []
    
    class Config:
        from_attributes = True

# Advertisement schemas
class AdvertisementBase(BaseModel):
    title: str
    short_description: str
    long_description: Optional[str] = None
    instrument_id: int
    location_id: int

class AdvertisementCreate(AdvertisementBase):
    pass

class AdvertisementUpdate(BaseModel):
    title: Optional[str] = None
    short_description: Optional[str] = None
    long_description: Optional[str] = None
    instrument_id: Optional[int] = None
    location_id: Optional[int] = None
    status: Optional[AdStatus] = None
    featured: Optional[bool] = None

class AdvertisementResponse(AdvertisementBase):
    id: int
    teacher_id: int
    status: AdStatus
    featured: bool
    views: int
    contacts: int
    created_at: datetime
    expires_at: Optional[datetime]
    teacher: UserResponse
    instrument: InstrumentResponse
    location: LocationResponse
    
    class Config:
        from_attributes = True

# Search schemas
class SearchFilters(BaseModel):
    instrument: Optional[str] = None
    city: Optional[str] = None
    level: Optional[str] = None
    online_only: Optional[bool] = None
    min_price: Optional[int] = None
    max_price: Optional[int] = None

class SearchResponse(BaseModel):
    advertisements: List[AdvertisementResponse]
    total: int
    page: int
    per_page: int

# Contact message schemas
class ContactMessageBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    message: str

class ContactMessageCreate(ContactMessageBase):
    recipient_id: int
    advertisement_id: Optional[int] = None

class ContactMessageResponse(ContactMessageBase):
    id: int
    sender_id: Optional[int]
    recipient_id: int
    advertisement_id: Optional[int]
    is_read: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Payment schemas
class PaymentBase(BaseModel):
    amount: Decimal
    currency: str = "HUF"
    payment_type: str
    description: Optional[str] = None

class PaymentCreate(PaymentBase):
    pass

class PaymentResponse(PaymentBase):
    id: int
    user_id: int
    status: str
    stripe_payment_intent_id: Optional[str]
    created_at: datetime
    completed_at: Optional[datetime]
    
    class Config:
        from_attributes = True

# Token schema
class Token(BaseModel):
    access_token: str
    token_type: str

# Featured teacher schema
class FeaturedTeacherResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    bio_short: Optional[str]
    years_experience: int
    lesson_price: Optional[Decimal]
    instruments: List[str]
    locations: List[str]
    teaching_online: bool
    
    class Config:
        from_attributes = True
