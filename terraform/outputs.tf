output "database_id" {
  value       = google_firestore_database.default.name
  description = "The name/ID of the default Firestore database"
}

output "database_location" {
  value       = google_firestore_database.default.location_id
  description = "The geographical location of the Firestore database instance"
}

output "project_services" {
  value = [
    google_project_service.firestore.service,
    google_project_service.identitytoolkit.service,
    google_project_service.firebase.service
  ]
  description = "The list of bootstrapped and enabled GCP services"
}
