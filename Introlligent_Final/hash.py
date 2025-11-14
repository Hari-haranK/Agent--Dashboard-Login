from werkzeug.security import generate_password_hash

# IMPORTANT: Replace 'YOUR_PASSWORD' with the actual plain text password you want to use (e.g., 'recruit_secure_pwd')
password_to_hash = 'recruit_secure_pwd' 

hash_value = generate_password_hash(password_to_hash) 

print("Copy this entire string and paste it into Supabase:")
print(hash_value)