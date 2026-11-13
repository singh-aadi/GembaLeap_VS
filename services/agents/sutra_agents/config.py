"""Runtime settings. Model ids are configuration, never code."""

import os
from dataclasses import dataclass


class ModelNotConfiguredError(RuntimeError):
    pass


@dataclass(frozen=True)
class Settings:
    flash_lite_model: str | None
    flash_model: str | None
    pro_model: str | None
    project: str | None
    region: str
    seed_path: str | None
    whatsapp_verify_token: str | None

    def model(self, tier: str) -> str:
        env = {
            "flash_lite": "GEMINI_FLASH_LITE_MODEL",
            "flash": "GEMINI_FLASH_MODEL",
            "pro": "GEMINI_PRO_MODEL",
        }[tier]
        model = {
            "flash_lite": self.flash_lite_model,
            "flash": self.flash_model,
            "pro": self.pro_model,
        }[tier]
        if not model:
            raise ModelNotConfiguredError(f"{env} is not set")
        return model


def settings() -> Settings:
    return Settings(
        flash_lite_model=os.environ.get("GEMINI_FLASH_LITE_MODEL"),
        flash_model=os.environ.get("GEMINI_FLASH_MODEL"),
        pro_model=os.environ.get("GEMINI_PRO_MODEL"),
        project=os.environ.get("GCP_PROJECT"),
        region=os.environ.get("GCP_REGION", "asia-south1"),
        seed_path=os.environ.get("SEED_PATH"),
        whatsapp_verify_token=os.environ.get("WHATSAPP_VERIFY_TOKEN"),
    )
