from database import SessionLocal, engine, Base
from models import User, TeacherProfile, Advertisement, Instrument, Location, TeacherInstrument, TeacherLocation, UserRole, AdStatus
from auth import get_password_hash
from datetime import datetime, timedelta
import sys

def edit_teacher_by_email(
    email: str,
    new_email: str = None,
    new_password: str = None,
    first_name: str = None,
    last_name: str = None,
    phone: str = None,
    bio_short: str = None,
    bio_long: str = None,
    years_experience: int = None,
    lesson_price: float = None,
    teaching_online: bool = None,
    teaching_at_student: bool = None,
    teaching_at_teacher: bool = None,
    video_url: str = None
):
    """Edit a teacher's profile by email."""
    db = SessionLocal()
    try:
        # Find the user
        user = db.query(User).filter(User.email == email).first()
        if not user:
            print(f"❌ No user found with email: {email}")
            return False
        
        if user.role != UserRole.TEACHER:
            print(f"❌ User {email} is not a teacher (role: {user.role})")
            return False
        
        # Update user fields
        if new_email is not None:
            user.email = new_email
        if new_password is not None:
            user.hashed_password = get_password_hash(new_password)
        if first_name is not None:
            user.first_name = first_name
        if last_name is not None:
            user.last_name = last_name
        if phone is not None:
            user.phone = phone
        
        # Update profile fields
        profile = user.teacher_profile
        if profile:
            if bio_short is not None:
                profile.bio_short = bio_short
            if bio_long is not None:
                profile.bio_long = bio_long
            if years_experience is not None:
                profile.years_experience = years_experience
            if lesson_price is not None:
                profile.lesson_price = lesson_price
            if teaching_online is not None:
                profile.teaching_online = teaching_online
            if teaching_at_student is not None:
                profile.teaching_at_student = teaching_at_student
            if teaching_at_teacher is not None:
                profile.teaching_at_teacher = teaching_at_teacher
            if video_url is not None:
                profile.video_url = video_url
        
        db.commit()
        print(f"✅ Successfully updated teacher: {user.first_name} {user.last_name}")
        return True
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error: {e}")
        return False
    finally:
        db.close()


def add_instrument_to_teacher(email: str, instrument_name: str, level: str = "all"):
    """Add an instrument to a teacher's profile."""
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user or user.role != UserRole.TEACHER:
            print(f"❌ Teacher not found: {email}")
            return False
        
        profile = user.teacher_profile
        if not profile:
            print(f"❌ No teacher profile found for: {email}")
            return False
        
        # Get or create instrument
        instrument = db.query(Instrument).filter(Instrument.name == instrument_name).first()
        if not instrument:
            instrument = Instrument(name=instrument_name, name_hu=instrument_name, category="Egyéb")
            db.add(instrument)
            db.flush()
        
        # Check if already linked
        existing = db.query(TeacherInstrument).filter(
            TeacherInstrument.teacher_id == profile.id,
            TeacherInstrument.instrument_id == instrument.id
        ).first()
        
        if existing:
            print(f"⚠️ Teacher already has instrument: {instrument_name}")
            return False
        
        # Link teacher to instrument
        teacher_instrument = TeacherInstrument(
            teacher_id=profile.id,
            instrument_id=instrument.id,
            level=level
        )
        db.add(teacher_instrument)
        db.commit()
        
        print(f"✅ Added instrument '{instrument_name}' to {user.first_name} {user.last_name}")
        return True
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error: {e}")
        return False
    finally:
        db.close()


def add_location_to_teacher(email: str, city: str, district: str = None):
    """Add a location to a teacher's profile."""
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user or user.role != UserRole.TEACHER:
            print(f"❌ Teacher not found: {email}")
            return False
        
        profile = user.teacher_profile
        if not profile:
            print(f"❌ No teacher profile found for: {email}")
            return False
        
        # Get or create location
        location = db.query(Location).filter(Location.city == city).first()
        if not location:
            location = Location(city=city, district=district)
            db.add(location)
            db.flush()
        
        # Check if already linked
        existing = db.query(TeacherLocation).filter(
            TeacherLocation.teacher_id == profile.id,
            TeacherLocation.location_id == location.id
        ).first()
        
        if existing:
            print(f"⚠️ Teacher already has location: {city}")
            return False
        
        # Link teacher to location
        teacher_location = TeacherLocation(
            teacher_id=profile.id,
            location_id=location.id
        )
        db.add(teacher_location)
        db.commit()
        
        print(f"✅ Added location '{city}' to {user.first_name} {user.last_name}")
        return True
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error: {e}")
        return False
    finally:
        db.close()


def show_teacher_details(email: str):
    """Show detailed information about a teacher."""
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            print(f"❌ No user found with email: {email}")
            return
        
        print(f"\n📋 Teacher Details:")
        print("=" * 60)
        print(f"  ID: {user.id}")
        print(f"  Email: {user.email}")
        print(f"  Name: {user.first_name} {user.last_name}")
        print(f"  Phone: {user.phone or 'N/A'}")
        print(f"  Role: {user.role}")
        print(f"  Active: {user.is_active}")
        
        profile = user.teacher_profile
        if profile:
            print(f"\n  Profile:")
            print(f"    Bio (short): {profile.bio_short or 'N/A'}")
            print(f"    Years experience: {profile.years_experience}")
            print(f"    Lesson price: {profile.lesson_price} HUF")
            print(f"    Teaching online: {profile.teaching_online}")
            print(f"    Teaching at student: {profile.teaching_at_student}")
            print(f"    Teaching at teacher: {profile.teaching_at_teacher}")
            print(f"    Video URL: {profile.video_url or 'N/A'}")
            
            instruments = [ti.instrument.name_hu for ti in profile.instruments]
            print(f"    Instruments: {', '.join(instruments) if instruments else 'N/A'}")
            
            locations = [tl.location.city for tl in profile.locations]
            print(f"    Locations: {', '.join(locations) if locations else 'N/A'}")
        
        ads = db.query(Advertisement).filter(Advertisement.teacher_id == user.id).all()
        if ads:
            print(f"\n  Advertisements ({len(ads)}):")
            for ad in ads:
                print(f"    - [{ad.status.value}] {ad.title}")
        
        print("=" * 60)
        
    finally:
        db.close()


def update_advertisement(
    email: str,
    ad_id: int = None,
    title: str = None,
    short_description: str = None,
    long_description: str = None,
    featured: bool = None,
    status: str = None
):
    """Update a teacher's advertisement."""
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user or user.role != UserRole.TEACHER:
            print(f"❌ Teacher not found: {email}")
            return False
        
        # Get the advertisement
        query = db.query(Advertisement).filter(Advertisement.teacher_id == user.id)
        if ad_id:
            query = query.filter(Advertisement.id == ad_id)
        
        ad = query.first()
        if not ad:
            print(f"❌ No advertisement found for teacher: {email}")
            return False
        
        # Update fields
        if title is not None:
            ad.title = title
        if short_description is not None:
            ad.short_description = short_description
        if long_description is not None:
            ad.long_description = long_description
        if featured is not None:
            ad.featured = featured
        if status is not None:
            ad.status = AdStatus(status)
        
        db.commit()
        print(f"✅ Updated advertisement: {ad.title}")
        return True
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error: {e}")
        return False
    finally:
        db.close()


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python edit_teacher.py show <email>                    - Show teacher details")
        print("  python edit_teacher.py edit <email> [field=value ...]  - Edit teacher")
        print("  python edit_teacher.py add-instrument <email> <name>   - Add instrument")
        print("  python edit_teacher.py add-location <email> <city>     - Add location")
        print("\nExample:")
        print("  python edit_teacher.py edit balogh.sara@example.com years_experience=10 lesson_price=9000")
        sys.exit(1)
    
    command = sys.argv[1].lower()
    
    if command == "show" and len(sys.argv) >= 3:
        show_teacher_details(sys.argv[2])
        
    elif command == "edit" and len(sys.argv) >= 3:
        email = sys.argv[2]
        kwargs = {}
        for arg in sys.argv[3:]:
            if "=" in arg:
                key, value = arg.split("=", 1)
                # Type conversion
                if key in ["years_experience"]:
                    value = int(value)
                elif key in ["lesson_price"]:
                    value = float(value)
                elif key in ["teaching_online", "teaching_at_student", "teaching_at_teacher"]:
                    value = value.lower() in ["true", "1", "yes"]
                kwargs[key] = value
        
        if kwargs:
            edit_teacher_by_email(email, **kwargs)
        else:
            print("No fields to update. Use field=value format.")
            
    elif command == "add-instrument" and len(sys.argv) >= 4:
        email = sys.argv[2]
        instrument = sys.argv[3]
        level = sys.argv[4] if len(sys.argv) >= 5 else "all"
        add_instrument_to_teacher(email, instrument, level)
        
    elif command == "add-location" and len(sys.argv) >= 4:
        email = sys.argv[2]
        city = sys.argv[3]
        district = sys.argv[4] if len(sys.argv) >= 5 else None
        add_location_to_teacher(email, city, district)
        
    else:
        print("Invalid command or missing arguments.")
