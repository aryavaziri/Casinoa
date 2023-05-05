FROM python:3.8-slim-buster

RUN pip install --upgrade pip
RUN python -m pip install -U pip
RUN apt-get update \
    && apt-get -y install libpq-dev gcc

COPY ./requirements.txt .
RUN pip install -r requirements.txt

COPY . /backend/
RUN chmod -R 755 /backend

WORKDIR /backend/

COPY ./entrypoint.sh /backend/
ENTRYPOINT ["sh", "/backend/entrypoint.sh"]