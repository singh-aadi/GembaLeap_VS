output "web_url" {
  value = google_cloud_run_v2_service.web.uri
}

output "agents_url" {
  value = google_cloud_run_v2_service.agents.uri
}

output "media_bucket" {
  value = google_storage_bucket.media.name
}
