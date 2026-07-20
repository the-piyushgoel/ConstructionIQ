from fastapi import FastAPI

app = FastAPI(title="Construction IQ AI Service")

@app.get("/health")
def health_check():
    return {"status": "ok"}
