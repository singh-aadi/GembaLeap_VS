terraform {
  required_version = ">= 1.9"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 6.0"
    }
  }

  # Configure the state bucket per environment: terraform init -backend-config="bucket=..."
  backend "gcs" {
    prefix = "gembaleap"
  }
}

provider "google" {
  project = var.project
  region  = var.region
}
