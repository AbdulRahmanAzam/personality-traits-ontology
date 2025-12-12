# app/db/mongodb.py

from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.server_api import ServerApi
import os


MONGODB_URI = os.getenv(
    "MONGODB_URI",
    "mongodb://localhost:27017"   # default for local MongoDB
)

client = AsyncIOMotorClient(MONGODB_URI, server_api=ServerApi('1'))
db = client["my_database"]
