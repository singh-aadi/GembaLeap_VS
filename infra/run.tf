resource "google_cloud_run_v2_service" "agents" {
  name     = "gembaleap-agents"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_INTERNAL_ONLY"

  template {
    service_account                  = google_service_account.agents.email
    max_instance_request_concurrency = 20

    scaling {
      min_instance_count = var.min_instances
    }

    containers {
      image = var.agents_image
      env {
        name  = "GEMINI_FLASH_MODEL"
        value = var.gemini_flash_model
      }
      env {
        name  = "GEMINI_PRO_MODEL"
        value = var.gemini_pro_model
      }
      env {
        name  = "GOOGLE_GENAI_USE_VERTEXAI"
        value = "true"
      }
      env {
        name  = "GOOGLE_CLOUD_PROJECT"
        value = var.project
      }
      env {
        name  = "GOOGLE_CLOUD_LOCATION"
        value = var.region
      }
    }
  }
}

resource "google_cloud_run_v2_service" "web" {
  name     = "gembaleap-web"
  location = var.region

  template {
    service_account = google_service_account.web.email

    scaling {
      min_instance_count = var.min_instances
    }

    containers {
      image = var.web_image
      env {
        name  = "AGENTS_BASE_URL"
        value = google_cloud_run_v2_service.agents.uri
      }
      env {
        name  = "MEDIA_BUCKET"
        value = google_storage_bucket.media.name
      }
      env {
        name  = "GCP_PROJECT"
        value = var.project
      }
      env {
        name = "SESSION_SECRET"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.session.secret_id
            version = "latest"
          }
        }
      }
    }
  }
}

resource "google_cloud_run_v2_service_iam_member" "web_public" {
  name     = google_cloud_run_v2_service.web.name
  location = var.region
  role     = "roles/run.invoker"
  member   = "allUsers"
}
