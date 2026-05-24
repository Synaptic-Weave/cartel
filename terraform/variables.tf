variable "project_id" {
  type        = string
  description = "The Google Cloud Platform project ID"
  default     = "cartel-sw"
}

variable "region" {
  type        = string
  description = "The target region for GCP resources"
  default     = "us-central1"
}

variable "environment" {
  type        = string
  description = "Deployment environment (e.g., dev, staging, prod)"
  default     = "dev"
}
