from database import SessionLocal, engine, Base
from models import User, TeacherProfile, Advertisement, TeacherInstrument, TeacherLocation, UserRole
import sys

def delete_teacher_by_email(email: str):
    """Delete a teacher and all related data by email."""
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
        
        user_id = user.id
        user_name = f"{user.first_name} {user.last_name}"
        
        # Delete advertisements
        ads_deleted = db.query(Advertisement).filter(Advertisement.teacher_id == user_id).delete()
        
        # Get teacher profile
        profile = db.query(TeacherProfile).filter(TeacherProfile.user_id == user_id).first()
        if profile:
            # Delete teacher instruments
            instruments_deleted = db.query(TeacherInstrument).filter(
                TeacherInstrument.teacher_id == profile.id
            ).delete()
            
            # Delete teacher locations
            locations_deleted = db.query(TeacherLocation).filter(
                TeacherLocation.teacher_id == profile.id
            ).delete()
            
            # Delete teacher profile
            db.delete(profile)
        
        # Delete user
        db.delete(user)
        
        db.commit()
        print(f"✅ Successfully deleted teacher: {user_name} ({email})")
        print(f"   - Advertisements deleted: {ads_deleted}")
        if profile:
            print(f"   - Instrument links deleted: {instruments_deleted}")
            print(f"   - Location links deleted: {locations_deleted}")
        return True
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error: {e}")
        return False
    finally:
        db.close()


def delete_teacher_by_id(user_id: int):
    """Delete a teacher and all related data by user ID."""
    db = SessionLocal()
    try:
        # Find the user
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            print(f"❌ No user found with ID: {user_id}")
            return False
        
        if user.role != UserRole.TEACHER:
            print(f"❌ User ID {user_id} is not a teacher (role: {user.role})")
            return False
        
        return delete_teacher_by_email(user.email)
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    finally:
        db.close()


def list_teachers():
    """List all teachers in the database."""
    db = SessionLocal()
    try:
        teachers = db.query(User).filter(User.role == UserRole.TEACHER).all()
        if not teachers:
            print("No teachers found in the database.")
            return
        
        print("\n📋 Teachers in database:")
        print("-" * 60)
        for teacher in teachers:
            profile = teacher.teacher_profile
            print(f"  ID: {teacher.id}")
            print(f"  Name: {teacher.first_name} {teacher.last_name}")
            print(f"  Email: {teacher.email}")
            if profile:
                print(f"  Experience: {profile.years_experience} years")
                print(f"  Price: {profile.lesson_price} HUF/hour")
            print("-" * 60)
            
    finally:
        db.close()


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python delete_teacher.py list                  - List all teachers")
        print("  python delete_teacher.py email <email>         - Delete by email")
        print("  python delete_teacher.py id <user_id>          - Delete by user ID")
        sys.exit(1)
    
    command = sys.argv[1].lower()
    
    if command == "list":
        list_teachers()
    elif command == "email" and len(sys.argv) >= 3:
        delete_teacher_by_email(sys.argv[2])
    elif command == "id" and len(sys.argv) >= 3:
        delete_teacher_by_id(int(sys.argv[2]))
    else:
        print("Invalid command. Use 'list', 'email <email>', or 'id <user_id>'")
