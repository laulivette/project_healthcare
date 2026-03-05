FROM python:3.11
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
# RUN pip install pymongo pandas
CMD ["python", "import.py"]