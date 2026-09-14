FROM python:3.12.11-slim-bookworm

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       bash ca-certificates ffmpeg git gh gzip tar \
    && rm -rf /var/lib/apt/lists/*

COPY requirements-asr.lock /opt/videha/requirements-asr.lock
RUN python -m pip install --no-cache-dir -r /opt/videha/requirements-asr.lock

WORKDIR /workspace
CMD ["python", "--version"]
