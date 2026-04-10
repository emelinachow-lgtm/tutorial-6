from fastapi import FastAPI, HTTPException, Depends
from typing import List
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session 
from to_do_app_crud import (
    Todo,
    get_session,
    db_create_todo,
    db_get_todos,
    db_update_todo,
    db_delete_todo,
)

app = FastAPI(title="Simple To-Do API")

# Define the origins that are allowed to talk to your server
origins = [
    "http://localhost:3000",  # Default React port
    "http://127.0.0.1:3000",
    "http://localhost:5173",  # Default Vite/React port
    "http://127.0.0.1:5173",
]

# Used for pre-built middleware classes (like CORS or GZip)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Allows all headers
)

# --- Endpoints ---


@app.get("/todos", response_model=List[Todo])
async def get_all_todos(session: Session = Depends(get_session)):
    """Fetch the entire to-do list."""
    # Add your code here...
    return await db_get_todos(session)  # Return the list of to-do items


@app.post("/todos", response_model=Todo)
async def create_todo(item: Todo, session: Session = Depends(get_session)):
    """Add a new task to the list."""
    return await db_create_todo(session, item)  # Return the newly added item back to client.


@app.put("/todos/{todo_id}", response_model=Todo)
async def update_todo(todo_id: str, updated_item: Todo, session: Session = Depends(get_session)):
    """Update an existing task by its ID."""
    # Add your code here...
    result = await db_update_todo(session, todo_id, updated_item) # Return the updated item back to client.
    if not result:
        raise HTTPException(status_code=404, detail="Item not found.")  # If item with given ID is not found    
    return result

@app.delete("/todos/{todo_id}")
async def delete_todo(todo_id: str, session: Session = Depends(get_session)):
    """Remove a task from the list."""
    # Add your code here...
    result = await db_delete_todo(session, todo_id)  # Call the database function to delete the item
    if not result:
        raise HTTPException(status_code=404, detail="Item not found.")  # If item with given ID is not found
    return {"detail": "Item deleted successfully."}  # Return a success message