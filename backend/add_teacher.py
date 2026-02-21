from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
from models import User, TeacherProfile, Advertisement, Instrument, Location, TeacherInstrument, TeacherLocation, UserRole, AdStatus
from auth import get_password_hash
from datetime import datetime, timedelta

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

def add_sara_balogh():
    db = SessionLocal()
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == "balogh.sara@example.com").first()
        if existing_user:
            print("Teacher already exists!")
            return
        
        # Create user
        user = User(
            email="balogh.sara@example.com",
            hashed_password=get_password_hash("temporary123"),
            first_name="Balogh",
            last_name="Sára",
            phone="+36301234567",
            role=UserRole.TEACHER
        )
        db.add(user)
        db.flush()  # Get the user ID
        
        # Create teacher profile
        teacher_profile = TeacherProfile(
            user_id=user.id,
            bio_long="Tapasztalt énektanár, aki szenvedélyesen tanítja a helyes énektechnikát és a zenei kifejezőkészséget. Több mint 8 éve oktat különböző korosztályokat.\n\nVégzettség: Liszt Ferenc Zeneművészeti Egyetem, Ének tanár szakirány\n\nMódszer: Egyéni igényekhez igazított oktatás, hangtechnika fejlesztése, repertoár építése",
            bio_short="Énektanár több mint 20 év tapasztalattal, kezdőknek és haladóknak",
            years_experience=20,
            lesson_price=7000.00,
            teaching_online=False,
            teaching_at_student=False,
            teaching_at_teacher=True
        )
        db.add(teacher_profile)
        db.flush()
        
        # Get or create instrument
        instrument = db.query(Instrument).filter(Instrument.name == "Ének").first()
        if not instrument:
            instrument = Instrument(name="Ének", name_hu="Ének", category="Vokális")
            db.add(instrument)
            db.flush()
        
        # Link teacher to instrument
        teacher_instrument = TeacherInstrument(
            teacher_id=teacher_profile.id,
            instrument_id=instrument.id,
            level="all"
        )
        db.add(teacher_instrument)
        
        # Get or create location
        location = db.query(Location).filter(Location.city == "Budapest").first()
        if not location:
            location = Location(city="Budapest", district="V. kerület")
            db.add(location)
            db.flush()
        
        # Link teacher to location
        teacher_location = TeacherLocation(
            teacher_id=teacher_profile.id,
            location_id=location.id
        )
        db.add(teacher_location)
        
        # Create advertisement
        advertisement = Advertisement(
            teacher_id=user.id,
            title="Énekórák kezdőknek és haladóknak",
            short_description="Tapasztalt énektanár vár mindenkit szeretettel, aki fejleszteni szeretné énektudását.",
            long_description="Egyéni énekórákat tartok kezdőknek és haladóknak egyaránt. \n\nFoglalkozunk:\n- Helyes légzéstechnikával\n- Hangképzéssel és hangfejlesztéssel\n- Repertoár építéssel\n- Előadói készségek fejlesztésével\n\nOnline és személyes órák is elérhetőek. Több éves tapasztalattal rendelkezem különböző korosztályok oktatásában. Várom szeretettel azokat, akik komolyabban szeretnének foglalkozni az énekléssel, vagy csak hobbiból szeretnének énekelni tanulni.",
            location_id=location.id,
            instrument_id=instrument.id,
            status=AdStatus.ACTIVE,
            featured=True,
            expires_at=datetime.now() + timedelta(days=90)
        )
        db.add(advertisement)
        
        db.commit()
        print("✅ Balogh Sára successfully added as featured teacher!")
        print(f"   User ID: {user.id}")
        print(f"   Teacher Profile ID: {teacher_profile.id}")
        print(f"   Advertisement ID: {advertisement.id}")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    add_sara_balogh()
