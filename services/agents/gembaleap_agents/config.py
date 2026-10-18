"""Runtime settings. Model ids are configuration, never code."""

import os
from dataclasses import dataclass


class ModelNotConfiguredError(RuntimeError):
    pass


@dataclass(frozen=True)
class Settings:
    flash_model: str | None
    pro_model: str | None
    project: str | None
    region: str
    seed_path: str | None

    def model(self, tier: str) -> str:
        model = self.flash_model if tier == "flash" else self.pro_model
        if not model:
            env = "GEMINI_FLASH_MODEL" if tier == "flash" else "GEMINI_PRO_MODEL"
            raise ModelNotConfiguredError(f"{env} is not set")
        return model


def settings() -> Settings:
    return Settings(
        flash_model=os.environ.get("GEMINI_FLASH_MODEL"),
        pro_model=os.environ.get("GEMINI_PRO_MODEL"),
        project=os.environ.get("GCP_PROJECT"),
        region=os.environ.get("GCP_REGION", "asia-northeast1"),
        seed_path=os.environ.get("SEED_PATH"),
    )
