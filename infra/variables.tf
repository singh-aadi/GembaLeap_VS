variable "project" {
  description = "GCP project id."
  type        = string
}

variable "region" {
  description = "Region for Cloud Run, Firestore, storage and BigQuery."
  type        = string
  default     = "asia-northeast1"
}

variable "web_image" {
  description = "Artifact Registry image for the web app."
  type        = string
}

variable "agents_image" {
  description = "Artifact Registry image for the agent service."
  type        = string
}

variable "gemini_flash_model" {
  description = "Model id for Flash-class agents."
  type        = string
}

variable "gemini_pro_model" {
  description = "Model id for Pro-class agents."
  type        = string
}

variable "min_instances" {
  description = "Minimum Cloud Run instances. 1 during demos to avoid cold starts."
  type        = number
  default     = 0
}
