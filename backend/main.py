from fastapi import FastAPI, Depends, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List, Optional
import os
from dotenv import load_dotenv

from database import engine, Base, get_db
from models import User, TeacherProfile, Instrument, Location, Advertisement, ContactMessage, Payment, UserRole, AdStatus, SubscriptionType
from schemas import (
    UserCreate, UserResponse, UserLogin,
    InstrumentCreate, InstrumentResponse,
    LocationCreate, LocationResponse,
    TeacherProfileCreate, TeacherProfileResponse,
    AdvertisementCreate, AdvertisementResponse, AdvertisementUpdate,
    ContactMessageCreate, ContactMessageResponse,
    PaymentCreate, PaymentResponse,
    SearchFilters, SearchResponse, Token
)
from auth import authenticate_user, create_access_token, get_current_user, get_password_hash, ACCESS_TOKEN_EXPIRE_MINUTES
from datetime import datetime, timedelta
import stripe
import admin_routes

load_dotenv()

# Create database tables
Base.metadata.create_all(bind=engine)

# Stripe configuration
stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "sk_test_dummy")

app = FastAPI(title="ZeneTanár.hu API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Include admin routes
app.include_router(admin_routes.router)

# ==================== AUTH ENDPOINTS ====================

@app.post("/api/auth/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        hashed_password=hashed_password,
        first_name=user.first_name,
        last_name=user.last_name,
        phone=user.phone,
        role=user.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Create teacher profile if role is teacher
    if user.role == UserRole.TEACHER:
        teacher_profile = TeacherProfile(user_id=db_user.id)
        db.add(teacher_profile)
        db.commit()
    
    return db_user

@app.post("/api/auth/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/auth/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

# ==================== USER PROFILE ENDPOINTS ====================

@app.get("/api/users/profile")
def get_user_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get full user profile with advertisements"""
    profile_data = {
        "id": current_user.id,
        "email": current_user.email,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "phone": current_user.phone,
        "role": current_user.role.value,
        "created_at": current_user.created_at.isoformat() if current_user.created_at else None,
    }
    
    # Get teacher profile if user is a teacher
    if current_user.role == UserRole.TEACHER and current_user.teacher_profile:
        tp = current_user.teacher_profile
        profile_data["teacher_profile"] = {
            "bio_short": tp.bio_short,
            "bio_long": tp.bio_long,
            "video_url": tp.video_url,
            "years_experience": tp.years_experience,
            "lesson_price": float(tp.lesson_price) if tp.lesson_price else None,
            "price_currency": tp.price_currency,
            "teaching_online": tp.teaching_online,
            "teaching_at_student": tp.teaching_at_student,
            "teaching_at_teacher": tp.teaching_at_teacher,
            "subscription_type": tp.subscription_type.value,
            "subscription_expires": tp.subscription_expires.isoformat() if tp.subscription_expires else None,
        }
    
    # Get user's advertisements
    ads = db.query(Advertisement).filter(Advertisement.teacher_id == current_user.id).all()
    profile_data["advertisements"] = [
        {
            "id": ad.id,
            "title": ad.title,
            "short_description": ad.short_description,
            "status": ad.status.value,
            "featured": ad.featured,
            "views": ad.views,
            "contacts": ad.contacts,
            "created_at": ad.created_at.isoformat() if ad.created_at else None,
            "expires_at": ad.expires_at.isoformat() if ad.expires_at else None,
            "instrument": ad.instrument.name_hu if ad.instrument else None,
            "location": ad.location.city if ad.location else None,
        }
        for ad in ads
    ]
    
    return profile_data

@app.put("/api/users/profile")
def update_user_profile(
    profile_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user profile"""
    # Update basic user info
    if "first_name" in profile_data:
        current_user.first_name = profile_data["first_name"]
    if "last_name" in profile_data:
        current_user.last_name = profile_data["last_name"]
    if "phone" in profile_data:
        current_user.phone = profile_data["phone"]
    
    # Update teacher profile if provided
    if current_user.role == UserRole.TEACHER and "teacher_profile" in profile_data:
        tp_data = profile_data["teacher_profile"]
        tp = current_user.teacher_profile
        
        if not tp:
            tp = TeacherProfile(user_id=current_user.id)
            db.add(tp)
        
        if "bio_short" in tp_data:
            tp.bio_short = tp_data["bio_short"]
        if "bio_long" in tp_data:
            tp.bio_long = tp_data["bio_long"]
        if "video_url" in tp_data:
            tp.video_url = tp_data["video_url"]
        if "years_experience" in tp_data:
            tp.years_experience = tp_data["years_experience"]
        if "lesson_price" in tp_data:
            tp.lesson_price = tp_data["lesson_price"]
        if "teaching_online" in tp_data:
            tp.teaching_online = tp_data["teaching_online"]
        if "teaching_at_student" in tp_data:
            tp.teaching_at_student = tp_data["teaching_at_student"]
        if "teaching_at_teacher" in tp_data:
            tp.teaching_at_teacher = tp_data["teaching_at_teacher"]
    
    db.commit()
    db.refresh(current_user)
    
    return {"message": "Profile updated successfully"}

@app.get("/api/users/my-advertisements")
def get_my_advertisements(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's advertisements"""
    ads = db.query(Advertisement).filter(
        Advertisement.teacher_id == current_user.id
    ).order_by(Advertisement.created_at.desc()).all()
    
    return [
        {
            "id": ad.id,
            "title": ad.title,
            "short_description": ad.short_description,
            "long_description": ad.long_description,
            "status": ad.status.value,
            "featured": ad.featured,
            "views": ad.views,
            "contacts": ad.contacts,
            "created_at": ad.created_at.isoformat() if ad.created_at else None,
            "expires_at": ad.expires_at.isoformat() if ad.expires_at else None,
            "days_remaining": (ad.expires_at - datetime.utcnow()).days if ad.expires_at else None,
            "instrument": ad.instrument.name_hu if ad.instrument else None,
            "location": ad.location.city if ad.location else None,
        }
        for ad in ads
    ]

# ==================== INSTRUMENT ENDPOINTS ====================

@app.get("/api/instruments", response_model=List[InstrumentResponse])
def get_instruments(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(Instrument).offset(skip).limit(limit).all()

@app.post("/api/instruments", response_model=InstrumentResponse)
def create_instrument(instrument: InstrumentCreate, db: Session = Depends(get_db)):
    db_instrument = Instrument(**instrument.dict())
    db.add(db_instrument)
    db.commit()
    db.refresh(db_instrument)
    return db_instrument

# ==================== LOCATION ENDPOINTS ====================

@app.get("/api/locations", response_model=List[LocationResponse])
def get_locations(
    city: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    query = db.query(Location)
    if city:
        query = query.filter(Location.city.ilike(f"%{city}%"))
    return query.offset(skip).limit(limit).all()

@app.get("/api/locations/cities")
def get_cities(db: Session = Depends(get_db)):
    cities = db.query(Location.city).distinct().all()
    return [city[0] for city in cities]

@app.post("/api/locations", response_model=LocationResponse)
def create_location(location: LocationCreate, db: Session = Depends(get_db)):
    db_location = Location(**location.dict())
    db.add(db_location)
    db.commit()
    db.refresh(db_location)
    return db_location

# ==================== ADVERTISEMENT ENDPOINTS ====================

@app.get("/api/advertisements", response_model=SearchResponse)
def search_advertisements(
    instrument: Optional[str] = None,
    city: Optional[str] = None,
    keyword: Optional[str] = None,
    online_only: Optional[bool] = None,
    featured_only: Optional[bool] = None,
    page: int = Query(1, ge=1),
    per_page: int = Query(12, ge=1, le=50),
    db: Session = Depends(get_db)
):
    query = db.query(Advertisement).filter(Advertisement.status == AdStatus.ACTIVE)
    
    if instrument:
        query = query.join(Instrument).filter(Instrument.name_hu.ilike(f"%{instrument}%"))
    
    if city:
        query = query.join(Location).filter(Location.city.ilike(f"%{city}%"))
    
    if keyword:
        query = query.filter(
            (Advertisement.title.ilike(f"%{keyword}%")) |
            (Advertisement.short_description.ilike(f"%{keyword}%"))
        )
    
    if online_only:
        query = query.join(User).join(TeacherProfile).filter(TeacherProfile.teaching_online == True)
    
    if featured_only:
        query = query.filter(Advertisement.featured == True)
    
    total = query.count()
    advertisements = query.offset((page - 1) * per_page).limit(per_page).all()
    
    return {
        "advertisements": advertisements,
        "total": total,
        "page": page,
        "per_page": per_page
    }

@app.get("/api/advertisements/{ad_id}", response_model=AdvertisementResponse)
def get_advertisement(ad_id: int, db: Session = Depends(get_db)):
    ad = db.query(Advertisement).filter(Advertisement.id == ad_id).first()
    if not ad:
        raise HTTPException(status_code=404, detail="Advertisement not found")
    
    # Increment view count
    ad.views += 1
    db.commit()
    
    return ad

@app.post("/api/advertisements", response_model=AdvertisementResponse)
def create_advertisement(
    ad: AdvertisementCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != UserRole.TEACHER:
        raise HTTPException(status_code=403, detail="Only teachers can create advertisements")
    
    db_ad = Advertisement(
        **ad.dict(),
        teacher_id=current_user.id,
        status=AdStatus.PENDING,  # New ads start as pending
        expires_at=datetime.utcnow() + timedelta(days=30)  # 30 days expiration
    )
    db.add(db_ad)
    db.commit()
    db.refresh(db_ad)
    return db_ad

@app.put("/api/advertisements/{ad_id}", response_model=AdvertisementResponse)
def update_advertisement(
    ad_id: int,
    ad_update: AdvertisementUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ad = db.query(Advertisement).filter(Advertisement.id == ad_id).first()
    if not ad:
        raise HTTPException(status_code=404, detail="Advertisement not found")
    if ad.teacher_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    for field, value in ad_update.dict(exclude_unset=True).items():
        setattr(ad, field, value)
    
    db.commit()
    db.refresh(ad)
    return ad

@app.delete("/api/advertisements/{ad_id}")
def delete_advertisement(
    ad_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ad = db.query(Advertisement).filter(Advertisement.id == ad_id).first()
    if not ad:
        raise HTTPException(status_code=404, detail="Advertisement not found")
    if ad.teacher_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    db.delete(ad)
    db.commit()
    return {"message": "Advertisement deleted successfully"}

# ==================== TEACHER ENDPOINTS ====================

@app.get("/api/teachers/featured")
def get_featured_teachers(limit: int = 6, db: Session = Depends(get_db)):
    teachers = db.query(User).join(TeacherProfile).filter(
        User.role == UserRole.TEACHER,
        User.is_active == True
    ).limit(limit).all()
    
    result = []
    for teacher in teachers:
        profile = teacher.teacher_profile
        if profile:
            result.append({
                "id": teacher.id,
                "first_name": teacher.first_name,
                "last_name": teacher.last_name,
                "bio_short": profile.bio_short,
                "years_experience": profile.years_experience,
                "lesson_price": profile.lesson_price,
                "instruments": [ti.instrument.name_hu for ti in profile.instruments],
                "locations": [tl.location.city for tl in profile.locations],
                "teaching_online": profile.teaching_online
            })
    return result

@app.get("/api/teachers/{teacher_id}")
def get_teacher_profile(teacher_id: int, db: Session = Depends(get_db)):
    teacher = db.query(User).filter(User.id == teacher_id, User.role == UserRole.TEACHER).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    
    profile = teacher.teacher_profile
    return {
        "id": teacher.id,
        "first_name": teacher.first_name,
        "last_name": teacher.last_name,
        "email": teacher.email,
        "phone": teacher.phone,
        "profile": {
            "bio_short": profile.bio_short if profile else None,
            "bio_long": profile.bio_long if profile else None,
            "video_url": profile.video_url if profile else None,
            "years_experience": profile.years_experience if profile else 0,
            "lesson_price": profile.lesson_price if profile else None,
            "teaching_online": profile.teaching_online if profile else False,
            "teaching_at_student": profile.teaching_at_student if profile else False,
            "teaching_at_teacher": profile.teaching_at_teacher if profile else False,
            "instruments": [ti.instrument.name_hu for ti in profile.instruments] if profile else [],
            "locations": [tl.location.city for tl in profile.locations] if profile else []
        },
        "advertisements": [
            {
                "id": ad.id,
                "title": ad.title,
                "short_description": ad.short_description,
                "instrument": ad.instrument.name_hu if ad.instrument else None,
                "location": ad.location.city if ad.location else None
            }
            for ad in teacher.advertisements if ad.status == AdStatus.ACTIVE
        ]
    }

# ==================== CONTACT ENDPOINTS ====================

@app.post("/api/contact", response_model=ContactMessageResponse)
def send_contact_message(
    message: ContactMessageCreate,
    db: Session = Depends(get_db)
):
    db_message = ContactMessage(**message.dict())
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    
    # Increment contact count on advertisement
    if message.advertisement_id:
        ad = db.query(Advertisement).filter(Advertisement.id == message.advertisement_id).first()
        if ad:
            ad.contacts += 1
            db.commit()
    
    return db_message

@app.get("/api/contact/messages", response_model=List[ContactMessageResponse])
def get_contact_messages(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    messages = db.query(ContactMessage).filter(
        ContactMessage.recipient_id == current_user.id
    ).order_by(ContactMessage.created_at.desc()).all()
    return messages

# ==================== PAYMENT ENDPOINTS ====================

@app.post("/api/payments/create-intent")
def create_payment_intent(
    payment: PaymentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        intent = stripe.PaymentIntent.create(
            amount=int(payment.amount * 100),  # Convert to cents
            currency=payment.currency.lower(),
            metadata={
                "user_id": current_user.id,
                "payment_type": payment.payment_type
            }
        )
        
        # Save payment record
        db_payment = Payment(
            user_id=current_user.id,
            amount=payment.amount,
            currency=payment.currency,
            payment_type=payment.payment_type,
            description=payment.description,
            stripe_payment_intent_id=intent.id,
            status="pending"
        )
        db.add(db_payment)
        db.commit()
        
        return {"client_secret": intent.client_secret, "payment_id": db_payment.id}
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/payments/confirm/{payment_id}")
def confirm_payment(
    payment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment or payment.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    try:
        intent = stripe.PaymentIntent.retrieve(payment.stripe_payment_intent_id)
        if intent.status == "succeeded":
            payment.status = "completed"
            payment.completed_at = datetime.utcnow()
            
            # Update teacher subscription if payment is for premium
            if payment.payment_type == "subscription":
                profile = db.query(TeacherProfile).filter(
                    TeacherProfile.user_id == current_user.id
                ).first()
                if profile:
                    profile.subscription_type = SubscriptionType.PREMIUM
                    profile.subscription_expires = datetime.utcnow() + timedelta(days=30)
            
            db.commit()
            return {"status": "completed"}
        else:
            payment.status = "failed"
            db.commit()
            return {"status": "failed"}
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))

# ==================== SEED DATA ====================

@app.post("/api/seed")
def seed_data(db: Session = Depends(get_db)):
    """Seed initial data for testing"""
    # Add instruments
    instruments = [
        ("piano", "Zongora", "billentyűs"),
        ("guitar", "Gitár", "húros"),
        ("violin", "Hegedű", "húros"),
        ("voice", "Ének", "ének"),
        ("drums", "Dob", "ütős"),
        ("bass", "Basszusgitár", "húros"),
        ("saxophone", "Szaxofon", "fúvós"),
        ("flute", "Fuvola", "fúvós"),
        ("cello", "Cselló", "húros"),
        ("ukulele", "Ukulele", "húros"),
    ]
    
    for name, name_hu, category in instruments:
        if not db.query(Instrument).filter(Instrument.name == name).first():
            db.add(Instrument(name=name, name_hu=name_hu, category=category))
    
    # Add locations
    locations = [
        ("Budapest", None),
        ("Budapest", "I. kerület"),
        ("Budapest", "II. kerület"),
        ("Budapest", "V. kerület"),
        ("Budapest", "VI. kerület"),
        ("Budapest", "VII. kerület"),
        ("Budapest", "VIII. kerület"),
        ("Budapest", "IX. kerület"),
        ("Budapest", "XI. kerület"),
        ("Budapest", "XIII. kerület"),
        ("Debrecen", None),
        ("Szeged", None),
        ("Pécs", None),
        ("Győr", None),
        ("Miskolc", None),
    ]
    
    for city, district in locations:
        if not db.query(Location).filter(Location.city == city, Location.district == district).first():
            db.add(Location(city=city, district=district))
    
    db.commit()
    return {"message": "Seed data added successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
