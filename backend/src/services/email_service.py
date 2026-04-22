"""Email service for MVP. Integration with SMTP pending."""

import logging

logger = logging.getLogger(__name__)


def send_email(to: str, subject: str, body: str) -> dict:
    """Send email. MVP: logs instead of actual delivery."""
    logger.info(f"[EMAIL MVP] to={to}, subject={subject}")
    return {"status": "logged", "message": "Email logged (MVP: no SMTP integration)"}


def send_bulk_email(recipients: list[str], subject: str, body: str) -> list[dict]:
    """Send bulk email. MVP: logs each recipient."""
    results = []
    for recipient in recipients:
        result = send_email(recipient, subject, body)
        results.append(result)
    return results


def send_whatsapp(to: str, message: str) -> dict:
    """Send WhatsApp message. MVP: placeholder."""
    logger.info(f"[WHATSAPP MVP] to={to}, message={message}")
    return {"status": "placeholder", "message": "WhatsApp integration pending"}
