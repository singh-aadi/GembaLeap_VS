resource "google_service_account" "web" {
  account_id   = "gembaleap-web"
  display_name = "GembaLeap web app"
}

resource "google_service_account" "agents" {
  account_id   = "gembaleap-agents"
  display_name = "GembaLeap agent service"
}

locals {
  roles = {
    web    = ["roles/datastore.user", "roles/storage.objectAdmin", "roles/pubsub.publisher", "roles/firebaseauth.viewer"]
    agents = ["roles/datastore.viewer", "roles/storage.objectViewer", "roles/aiplatform.user", "roles/bigquery.dataEditor"]
  }
  accounts = {
    web    = google_service_account.web.email
    agents = google_service_account.agents.email
  }
  bindings = flatten([for who, roles in local.roles : [for role in roles : { who = who, role = role }]])
}

resource "google_project_iam_member" "service" {
  for_each = { for b in local.bindings : "${b.who}-${b.role}" => b }
  project  = var.project
  role     = each.value.role
  member   = "serviceAccount:${local.accounts[each.value.who]}"
}

resource "google_secret_manager_secret_iam_member" "web_session" {
  secret_id = google_secret_manager_secret.session.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.web.email}"
}

resource "google_kms_crypto_key_iam_member" "web_anchor" {
  crypto_key_id = google_kms_crypto_key.audit_anchor.id
  role          = "roles/cloudkms.signerVerifier"
  member        = "serviceAccount:${google_service_account.web.email}"
}

# Only the web app may call the agent service.
resource "google_cloud_run_v2_service_iam_member" "web_invokes_agents" {
  name     = google_cloud_run_v2_service.agents.name
  location = var.region
  role     = "roles/run.invoker"
  member   = "serviceAccount:${google_service_account.web.email}"
}
