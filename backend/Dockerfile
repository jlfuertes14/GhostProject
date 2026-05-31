FROM python:3.11-slim

# Create a non-root user for Hugging Face Spaces
RUN useradd -m -u 1000 user

# Switch to the non-root user
USER user
ENV PATH="/home/user/.local/bin:$PATH"

WORKDIR /home/user/app

# Copy requirements and install
COPY --chown=user requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code and necessary directories
COPY --chown=user . .

# Expose the Hugging Face Space default port
EXPOSE 7860

# Command to run the FastAPI server
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]
