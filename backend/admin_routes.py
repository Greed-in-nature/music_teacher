from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import datetime, timedelta

from database import get_db
from models import User, Advertisement, Payment, Instrument, Location, TeacherProfile, AdStatus, UserRole
from schemas import UserResponse, AdvertisementResponse
from auth import get_current_user

router = APIRouter(prefix="/api/admin", tags=["admin"])

def require_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user

# ==================== DASHBOARD STATS ====================

@router.get("/stats")
def get_dashboard_stats(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get dashboard statistics"""
    total_users = db.query(User).count()
    total_teachers = db.query(User).filter(User.role == UserRole.TEACHER).count()
    total_students = db.query(User).filter(User.role == UserRole.STUDENT).count()
    
    total_ads = db.query(Advertisement).count()
    pending_ads = db.query(Advertisement).filter(Advertisement.status == AdStatus.PENDING).count()
    active_ads = db.query(Advertisement).filter(Advertisement.status == AdStatus.ACTIVE).count()
    expired_ads = db.query(Advertisement).filter(Advertisement.status == AdStatus.EXPIRED).count()
    
    total_revenue = db.query(func.sum(Payment.amount)).filter(Payment.status == "completed").scalar() or 0
    
    # Ads expiring in next 7 days
    week_from_now = datetime.utcnow() + timedelta(days=7)
    expiring_soon = db.query(Advertisement).filter(
        Advertisement.status == AdStatus.ACTIVE,
        Advertisement.expires_at <= week_from_now
    ).count()
    
    return {
        "users": {
            "total": total_users,
            "teachers": total_teachers,
            "students": total_students
        },
        "advertisements": {
            "total": total_ads,
            "pending": pending_ads,
            "active": active_ads,
            "expired": expired_ads,
            "expiring_soon": expiring_soon
        },
        "revenue": float(total_revenue)
    }

# ==================== USER MANAGEMENT ====================

@router.get("/users", response_model=List[dict])
def get_all_users(
    skip: int = 0,
    limit: int = 100,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get all users with their details"""
    users = db.query(User).offset(skip).limit(limit).all()
    
    result = []
    for user in users:
        ad_count = db.query(Advertisement).filter(Advertisement.teacher_id == user.id).count()
        result.append({
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "phone": user.phone,
            "role": user.role.value,
            "is_active": user.is_active,
            "created_at": user.created_at.isoformat() if user.created_at else None,
            "advertisement_count": ad_count
        })
    
    return result

@router.get("/users/emails")
def get_all_user_emails(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get all user email addresses (for newsletter/export)"""
    users = db.query(User.email, User.first_name, User.last_name, User.role).all()
    
    return [
        {
            "email": u.email,
            "name": f"{u.first_name} {u.last_name}",
            "role": u.role.value
        }
        for u in users
    ]

@router.put("/users/{user_id}")
def update_user(
    user_id: int,
    user_data: dict,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Update user data"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update allowed fields
    if "first_name" in user_data:
        user.first_name = user_data["first_name"]
    if "last_name" in user_data:
        user.last_name = user_data["last_name"]
    if "phone" in user_data:
        user.phone = user_data["phone"]
    if "is_active" in user_data:
        user.is_active = user_data["is_active"]
    if "role" in user_data:
        user.role = UserRole(user_data["role"])
    
    db.commit()
    db.refresh(user)
    
    return {"message": "User updated successfully"}

@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Delete a user"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db.delete(user)
    db.commit()
    
    return {"message": "User deleted successfully"}

# ==================== ADVERTISEMENT MANAGEMENT ====================

@router.get("/advertisements")
def get_all_advertisements(
    status: str = None,
    skip: int = 0,
    limit: int = 100,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get all advertisements with filtering"""
    query = db.query(Advertisement)
    
    if status:
        query = query.filter(Advertisement.status == status)
    
    ads = query.order_by(Advertisement.created_at.desc()).offset(skip).limit(limit).all()
    
    result = []
    for ad in ads:
        result.append({
            "id": ad.id,
            "title": ad.title,
            "short_description": ad.short_description,
            "status": ad.status.value,
            "featured": ad.featured,
            "views": ad.views,
            "contacts": ad.contacts,
            "created_at": ad.created_at.isoformat() if ad.created_at else None,
            "expires_at": ad.expires_at.isoformat() if ad.expires_at else None,
            "teacher": {
                "id": ad.teacher.id,
                "name": f"{ad.teacher.first_name} {ad.teacher.last_name}",
                "email": ad.teacher.email
            },
            "instrument": ad.instrument.name_hu if ad.instrument else None,
            "location": ad.location.city if ad.location else None
        })
    
    return result

@router.put("/advertisements/{ad_id}/approve")
def approve_advertisement(
    ad_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Approve a pending advertisement"""
    ad = db.query(Advertisement).filter(Advertisement.id == ad_id).first()
    if not ad:
        raise HTTPException(status_code=404, detail="Advertisement not found")
    
    ad.status = AdStatus.ACTIVE
    ad.expires_at = datetime.utcnow() + timedelta(days=30)  # 30 days from approval
    
    db.commit()
    db.refresh(ad)
    
    return {"message": "Advertisement approved", "expires_at": ad.expires_at}

@router.put("/advertisements/{ad_id}/reject")
def reject_advertisement(
    ad_id: int,
    reason: str = None,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Reject a pending advertisement"""
    ad = db.query(Advertisement).filter(Advertisement.id == ad_id).first()
    if not ad:
        raise HTTPException(status_code=404, detail="Advertisement not found")
    
    ad.status = AdStatus.SUSPENDED
    
    db.commit()
    
    return {"message": "Advertisement rejected", "reason": reason}

@router.put("/advertisements/{ad_id}/extend")
def extend_advertisement(
    ad_id: int,
    days: int = 30,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Extend advertisement expiration"""
    ad = db.query(Advertisement).filter(Advertisement.id == ad_id).first()
    if not ad:
        raise HTTPException(status_code=404, detail="Advertisement not found")
    
    if ad.expires_at:
        ad.expires_at = ad.expires_at + timedelta(days=days)
    else:
        ad.expires_at = datetime.utcnow() + timedelta(days=days)
    
    db.commit()
    
    return {"message": f"Advertisement extended by {days} days", "expires_at": ad.expires_at}

@router.delete("/advertisements/{ad_id}")
def delete_advertisement(
    ad_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Delete an advertisement"""
    ad = db.query(Advertisement).filter(Advertisement.id == ad_id).first()
    if not ad:
        raise HTTPException(status_code=404, detail="Advertisement not found")
    
    db.delete(ad)
    db.commit()
    
    return {"message": "Advertisement deleted"}

# ==================== PRICING MANAGEMENT ====================

@router.get("/pricing")
def get_pricing_settings(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get current pricing settings"""
    # In a real app, these would be stored in a settings table
    return {
        "premium_monthly": 2900,
        "commission_percent": 10,
        "commission_max": 5000,
        "ad_duration_days": 30,
        "featured_ad_price": 5000
    }

@router.put("/pricing")
def update_pricing(
    pricing: dict,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Update pricing settings"""
    # In a real app, these would be stored in a settings table
    return {
        "message": "Pricing updated successfully",
        "pricing": pricing
    }

# ==================== INSTRUMENT & LOCATION STATS ====================

@router.get("/stats/instruments")
def get_instrument_stats(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get advertisement counts by instrument"""
    stats = db.query(
        Instrument.id,
        Instrument.name_hu,
        func.count(Advertisement.id).label("count")
    ).outerjoin(
        Advertisement, Advertisement.instrument_id == Instrument.id
    ).group_by(Instrument.id, Instrument.name_hu).all()
    
    return [
        {
            "id": s.id,
            "name": s.name_hu,
            "count": s.count
        }
        for s in stats
    ]

@router.get("/stats/locations")
def get_location_stats(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get advertisement counts by location"""
    stats = db.query(
        Location.id,
        Location.city,
        func.count(Advertisement.id).label("count")
    ).outerjoin(
        Advertisement, Advertisement.location_id == Location.id
    ).group_by(Location.id, Location.city).all()
    
    return [
        {
            "id": s.id,
            "city": s.city,
            "count": s.count
        }
        for s in stats
    ]
