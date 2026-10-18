locals {
  apis = [
    "run.googleapis.com",
    "artifactregistry.googleapis.com",
    "firestore.googleapis.com",
    "storage.googleapis.com",
    "aiplatform.googleapis.com",
    "pubsub.googleapis.com",
    "cloudscheduler.googleapis.com",
    "cloudkms.googleapis.com",
    "secretmanager.googleapis.com",
    "bigquery.googleapis.com",
    "identitytoolkit.googleapis.com",
  ]
}

resource "google_project_service" "apis" {
  for_each           = toset(local.apis)
  service            = each.value
  disable_on_destroy = false
}

resource "google_artifact_registry_repository" "images" {
  repository_id = "gembaleap"
  location      = var.region
  format        = "DOCKER"
  depends_on    = [google_project_service.apis]
}

# Operational store. Security rules deny all client access; the web app reads through server functions.
resource "google_firestore_database" "main" {
  name        = "(default)"
  location_id = var.region
  type        = "FIRESTORE_NATIVE"
  depends_on  = [google_project_service.apis]
}

resource "google_storage_bucket" "media" {
  name                        = "${var.project}-gembaleap-media"
  location                    = var.region
  uniform_bucket_level_access = true
  public_access_prevention    = "enforced"

  versioning {
    enabled = true
  }

  # Voice originals are kept as transcripts only after 30 days unless the supplier opts in.
  lifecycle_rule {
    condition {
      age            = 30
      matches_prefix = ["audio/"]
    }
    action {
      type = "Delete"
    }
  }
}

resource "google_pubsub_topic" "evidence_uploaded" {
  name = "evidence-uploaded"
}

resource "google_bigquery_dataset" "analytics" {
  dataset_id = "gembaleap"
  location   = var.region
}

resource "google_kms_key_ring" "audit" {
  name       = "gembaleap-audit"
  location   = var.region
  depends_on = [google_project_service.apis]
}

# Signs the daily audit-chain anchor.
resource "google_kms_crypto_key" "audit_anchor" {
  name     = "audit-anchor"
  key_ring = google_kms_key_ring.audit.id
  purpose  = "ASYMMETRIC_SIGN"

  version_template {
    algorithm = "EC_SIGN_P256_SHA256"
  }
}

resource "google_secret_manager_secret" "session" {
  secret_id = "session-secret"
  replication {
    auto {}
  }
}
