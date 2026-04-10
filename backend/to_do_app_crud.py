from fastapi import HTTPException
from sqlmodel import Field, SQLModel, Session, create_engine, select
from typing import List, Optional
from dotenv import load_dotenv
import os

load_dotenv()  # Load environment variables from .env file

# Establish a db connection
username = os.getenv("DB_USERNAME")
password = os.getenv("DB_PASSWORD")
database_name = os.getenv("DB_NAME")

DATABASE_URL = f"mysql+pymysql://{username}:{password}@localhost:3306/{database_name}"
engine = create_engine(DATABASE_URL, echo=True)


# Create a database table "todo"
class Todo(SQLModel, table=True):
    id: str = Field(max_length=25, primary_key=True)
    text: str
    completed: bool = False


# Create the table in the database if it doesn't exist
SQLModel.metadata.create_all(engine)


# Helper function to get a session
def get_session():
    """Yields a SQLModel Session instance."""
    with Session(engine) as session:
        yield session


# CRUD operations

async def db_create_todo(session: Session, todo_create: Todo) -> Todo:
    # Check if todo with this ID already exists
    existing = session.get(Todo, todo_create.id)
    if existing:
        raise HTTPException(status_code=400, detail="Todo with this ID already exists")
    session.add(todo_create)
    session.commit()
    session.refresh(todo_create)
    return todo_create


async def db_get_todo(session: Session, todo_id: str) -> Optional[Todo]:
    todo = session.get(Todo, todo_id)
    return todo


async def db_get_todos(session: Session, skip: int = 0, limit: int = 100) -> List[Todo]:
    todos = session.exec(select(Todo).offset(skip).limit(limit)).all()
    return todos


async def db_update_todo(session: Session, todo_id: str, todo_update: Todo) -> Optional[Todo]:
    todo = session.get(Todo, todo_id)
    if not todo:
        return None
    todo.text = todo_update.text
    todo.completed = todo_update.completed
    session.commit()
    session.refresh(todo)
    return todo


async def db_delete_todo(session: Session, todo_id: str) -> bool:
    todo = session.get(Todo, todo_id)
    if not todo:
        return False
    session.delete(todo)
    session.commit()
    return True