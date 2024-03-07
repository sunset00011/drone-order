import firebase_admin
from firebase_admin import credentials, db

# Replace 'path/to/your/credentials.json' with the path to your Firebase Admin SDK JSON key file
cred = credentials.Certificate('drone-location-389204-firebase-adminsdk-aslmn-fa3d2f9355.json')
firebase_admin.initialize_app(cred, {'databaseURL': 'https://drone-location-389204-default-rtdb.asia-southeast1.firebasedatabase.app/'})

# Replace 'new_latitude_value' and 'new_longitude_value' with the values you want to update
new_latitude_value = 21.036844
new_longitude_value = 105.782523

# Get a reference to the database
ref = db.reference('/location')

# Update the values
ref.update({
    'lat': new_latitude_value,
    'lng': new_longitude_value
})

print('Location updated successfully.')
