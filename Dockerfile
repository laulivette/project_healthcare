FROM python:3.11
WORKDIR /app
COPY . .
RUN pip install pymongo pandas
CMD ["python", "import.py"]